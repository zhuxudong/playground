export default `
varying vec2 v_uv;

uniform samplerCube environmentMap;
uniform vec2 textureInfo;
uniform float face;
uniform float linearRoughness;

#define PI 3.14159265359
#define RECIPROCAL_PI 0.31830988618

// PROD MODE
const uint SAMPLE_COUNT = 4096u;

// DEV MODE
// const uint SAMPLE_COUNT = 32u;

const float SAMPLE_COUNT_FLOAT = float(SAMPLE_COUNT);
const float SAMPLE_COUNT_FLOAT_INVERSED = 1. / SAMPLE_COUNT_FLOAT;

const float K = 4.;

float log4(float x) {
    return log2(x) / 2.;
}

float pow2( const in float x ) {
    return x * x;
}

vec4 RGBEToLinear(vec4 value) {
    return vec4( step(0.0, value.a) * value.rgb * exp2( value.a * 255.0 - 128.0 ), 1.0 );
}

vec4 LinearToRGBE( in vec4 value ) {
	float maxComponent = max( max( value.r, value.g ), value.b );
	float fExp = clamp( ceil( log2( maxComponent ) ), -128.0, 127.0 );
	return vec4( value.rgb / exp2( fExp ), ( fExp + 128.0 ) / 255.0 );
}


// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX( const in float alpha, const in float dotNH ) {

	float a2 = pow2( alpha );

	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return RECIPROCAL_PI * a2 / pow2( denom );

}



// https://learnopengl.com/PBR/IBL/Specular-IBL
// Hammersley
float radicalInverse_VdC(uint bits) 
{
    bits = (bits << 16u) | (bits >> 16u);
    bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
    bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
    bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
    bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
    return float(bits) * 2.3283064365386963e-10; // / 0x100000000
}

vec2 hammersley(uint i, uint N)
{
    return vec2(float(i)/float(N), radicalInverse_VdC(i));
}

// WebGL1 fallback
float VanDerCorpus(int n, int base)
{
    float invBase = 1.0 / float(base);
    float denom   = 1.0;
    float result  = 0.0;

    for(int i = 0; i < 32; ++i)
    {
        if(n > 0)
        {
            denom   = mod(float(n), 2.0);
            result += denom * invBase;
            invBase = invBase / 2.0;
            n       = int(float(n) / 2.0);
        }
    }

    return result;
}
// ----------------------------------------------------------------------------
vec2 HammersleyNoBitOps(int i, int N)
{
    return vec2(float(i)/float(N), VanDerCorpus(i, 2));
}


// https://www.tobias-franke.eu/log/2014/03/30/notes_on_importance_sampling.html
/*
 * Importance sampling
 * -------------------
 *
 * Important samples are chosen to integrate cos(theta) over the hemisphere.
 *
 * All calculations are made in tangent space, with n = [0 0 1]
 *
 *                      l (important sample)
 *                     /.
 *                    / .
 *                   /  .
 *                  /   .
 *         --------o----+-------> n (direction)
 *                   cos(theta)
 *                    = n•l
 *
 *
 *  'direction' is given as an input parameter, and serves as tge z direction of the tangent space.
 *
 *  l = important_sample_cos()
 *
 *  n•l = [0 0 1] • l = l.z
 *
 *           n•l
 *  pdf() = -----
 *           PI
 */
vec3 hemisphereCosSample(vec2 u) {
    // pdf = cosTheta / M_PI;
    float phi = 2. * PI * u.x;

    float cosTheta2 = 1. - u.y;
    float cosTheta = sqrt(cosTheta2);
    float sinTheta = sqrt(1. - cosTheta2);

    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
}

// https://www.tobias-franke.eu/log/2014/03/30/notes_on_importance_sampling.html
/*
 *
 * Importance sampling GGX - Trowbridge-Reitz
 * ------------------------------------------
 *
 * Important samples are chosen to integrate Dggx() * cos(theta) over the hemisphere.
 *
 * All calculations are made in tangent space, with n = [0 0 1]
 *
 *                      h (important sample)
 *                     /.
 *                    / .
 *                   /  .
 *                  /   .
 *         --------o----+-------> n
 *                   cos(theta)
 *                    = n•h
 *
 *  h is micro facet's normal
 *  l is the reflection of v around h, l = reflect(-v, h)  ==>  v•h = l•h
 *
 *  n•v is given as an input parameter at runtime
 *
 *  Since n = [0 0 1], we also have v.z = n•v
 *
 *  Since we need to compute v•h, we chose v as below. This choice only affects the
 *  computation of v•h (and therefore the fresnel term too), but doesn't affect
 *  n•l, which only relies on l.z (which itself only relies on v.z, i.e.: n•v)
 *
 *      | sqrt(1 - (n•v)^2)     (sin)
 *  v = | 0
 *      | n•v                   (cos)
 *
 *
 *  h = important_sample_ggx()
 */
vec3 hemisphereImportanceSampleDggx(vec2 u, float a) {
    // pdf = D(a) * cosTheta
    float phi = 2. * PI * u.x;

    // NOTE: (aa-1) == (a-1)(a+1) produces better fp accuracy
    float cosTheta2 = (1. - u.y) / (1. + (a + 1.) * ((a - 1.) * u.y));
    float cosTheta = sqrt(cosTheta2);
    float sinTheta = sqrt(1. - cosTheta2);

    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
}

/*
 *
 * Importance sampling Charlie
 * ---------------------------
 *
 * In order to pick the most significative samples and increase the convergence rate, we chose to
 * rely on Charlie's distribution function for the pdf as we do in hemisphereImportanceSampleDggx.
 *
 * To determine the direction we then need to resolve the cdf associated to the chosen pdf for random inputs.
 *
 * Knowing pdf() = DCharlie(h) <n•h>
 *
 * We need to find the cdf:
 *
 * / 2pi     / pi/2
 * |         |  (2 + (1 / a)) * sin(theta) ^ (1 / a) * cos(theta) * sin(theta)
 * / phi=0   / theta=0
 *
 * We sample theta and phi independently.
 *
 * 1. as in all the other isotropic cases phi = 2 * pi * epsilon
 *    (https://www.tobias-franke.eu/log/2014/03/30/notes_on_importance_sampling.html)
 *
 * 2. we need to solve the integral on theta:
 *
 *             / sTheta
 * P(sTheta) = |  (2 + (1 / a)) * sin(theta) ^ (1 / a + 1) * cos(theta) * dtheta
 *             / theta=0
 *
 * By subsitution of u = sin(theta) and du = cos(theta) * dtheta
 *
 * /
 * |  (2 + (1 / a)) * u ^ (1 / a + 1) * du
 * /
 *
 * = (2 + (1 / a)) * u ^ (1 / a + 2) / (1 / a + 2)
 *
 * = u ^ (1 / a + 2)
 *
 * = sin(theta) ^ (1 / a + 2)
 *
 *             +-                          -+ sTheta
 * P(sTheta) = |  sin(theta) ^ (1 / a + 2)  |
 *             +-                          -+ 0
 *
 * P(sTheta) = sin(sTheta) ^ (1 / a + 2)
 *
 * We now need to resolve the cdf for an epsilon value:
 *
 * epsilon = sin(theta) ^ (a / ( 2 * a + 1))
 *
 *  +--------------------------------------------+
 *  |                                            |
 *  |  sin(theta) = epsilon ^ (a / ( 2 * a + 1)) |
 *  |                                            |
 *  +--------------------------------------------+
 */
vec3 hemisphereImportanceSampleDCharlie(vec2 u, float a) { 
    // pdf = DistributionCharlie() * cosTheta
    float phi = 2. * PI * u.x;

    float sinTheta = pow(u.y, a / (2. * a + 1.));
    float cosTheta = sqrt(1. - sinTheta * sinTheta);

    return vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
}

vec3 specular(vec3 N) {
    vec3 result = vec3(0.0);

    // center the cone around the normal (handle case of normal close to up)
    vec3 up = abs(N.z) < 0.999 ? vec3(0, 0, 1) : vec3(1, 0, 0);

    mat3 R;
    R[0] = normalize(cross(up, N));
    R[1] = cross(N, R[0]);
    R[2] = N;

    float maxLevel = textureInfo.y;
    float dim0 = textureInfo.x;
    float omegaP = (4. * PI) / (6. * dim0 * dim0);

    float weight = 0.;
    for(uint i = 0u; i < SAMPLE_COUNT; ++i)
    {
        vec2 Xi = hammersley(i, SAMPLE_COUNT);
        vec3 H = hemisphereImportanceSampleDggx(Xi, linearRoughness);

        float NoV = 1.;
        float NoH = H.z;
        float NoH2 = H.z * H.z;
        float NoL = 2. * NoH2 - 1.;
        vec3 L = vec3(2. * NoH * H.x, 2. * NoH * H.y, NoL);
        L = normalize(L);

        if (NoL > 0.) {
            float pdf_inversed = 4. / D_GGX( linearRoughness, NoH);

            float omegaS = SAMPLE_COUNT_FLOAT_INVERSED * pdf_inversed;
            float l = log4(omegaS) - log4(omegaP) + log4(K);
            float mipLevel = clamp(float(l), 0.0, maxLevel);

            weight += NoL;

            vec4 c = textureCubeLodEXT(environmentMap, R * L, mipLevel);
            vec3 rgbe = RGBEToLinear(c).rgb;
            result += rgbe * NoL;
        }
    }

    result = result / weight;

    return result;
}

void main() 
{
    float cx = v_uv.x * 2. - 1.;
    float cy = v_uv.y * 2. - 1.;

    vec3 dir = vec3(0.);
    if (face == 0.) { // PX
        dir = vec3( 1.,  cy, -cx);
    }
    else if (face == 1.) { // NX
        dir = vec3(-1.,  cy,  cx);
    }
    else if (face == 2.) { // PY
        dir = vec3( cx,  1., -cy);
    }
    else if (face == 3.) { // NY
        dir = vec3( cx, -1.,  cy);
    }
    else if (face == 4.) { // PZ
        dir = vec3( cx,  cy,  1.);
    }
    else if (face == 5.) { // NZ
        dir = vec3(-cx,  cy, -1.);
    }
    dir = normalize(dir);

    if (linearRoughness == 0.) {
        gl_FragColor = textureCube(environmentMap, dir);
    }else{
        vec3 integratedBRDF = specular(dir);
        gl_FragColor = vec4(integratedBRDF, 1.);
        gl_FragColor = LinearToRGBE(gl_FragColor);
    }
}
`;
