#version 300 es
 
precision highp float;

in vec2 vTexCoord;

out vec4 oFragColor;

uniform sampler2D uSampler;

void main()
{
	vec4 color = texture(uSampler, vTexCoord);
	if (int(color.r * 255.0) == 255 && int(color.g * 255.0) == 174 && int(color.b * 255.0) == 201) discard;
	oFragColor = texture(uSampler, vTexCoord);
}