#version 300 es
 
precision highp float;

in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oFragColor;

/*uniform sampler2D uSampler;
uniform vec4 uColor;*/

void main()
{
	//oFragColor = texture(uSampler, vTexCoord) * uColor;
	oFragColor = vec4(vNormal, 1.0);
}