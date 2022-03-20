/**
 * @link https://github.com/jamieowen/glsl-blend
 */
export const blendmode = `
 vec3 blendMultiply(vec3 base, vec3 blend) {
   return base*blend;
 }
 
 vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
   return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
 }
 `
