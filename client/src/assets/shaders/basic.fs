#version 300 es
 
precision highp float;

in vec2 vTexCoord;
in vec3 vNormal;

out vec4 oFragColor;

uniform sampler2D uSampler;

void main()
{
	oFragColor = texture(uSampler, vTexCoord) * vec4(vNormal, 1.0);
	//oFragColor = vec4(vNormal + 0.25, 1.0);
}