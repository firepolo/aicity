#version 300 es

precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoord;
layout(location = 2) in vec3 aNormal;

out vec2 vTexCoord;

uniform vec3 uPosition;
uniform vec2 uLook;
uniform vec2 uCamera;

uniform Camera
{
	mat4 uProjection;
	mat4 uView;
};

void main()
{
	vec2 fromCamera = normalize(uPosition.xz - uCamera); 
	int z = int(dot(fromCamera, uLook) * 1.5);
	float x = dot(fromCamera, vec2(-uLook.y, uLook.x));

	if (z < 0)
	{
		if (x < 0.0) vTexCoord.x = aTexCoord.x * 0.125;
		else vTexCoord.x = (1.0 - aTexCoord.x) * 0.125;
	}
	else if (z > 0)
	{
		if (x < 0.0) vTexCoord.x = 0.5 + aTexCoord.x * 0.125;
		else vTexCoord.x = 0.5 + (1.0 - aTexCoord.x) * 0.125;
	}
	else
	{
		if (x < 0.0) vTexCoord.x = 0.25 + aTexCoord.x * 0.125;
		else vTexCoord.x = 0.25 + (1.0 - aTexCoord.x) * 0.125;
	}

	vTexCoord.y = aTexCoord.y * 0.25;
	
	vec3 position = uPosition + vec3(uView[0][0], uView[1][0], uView[2][0]) * aPosition.x + vec3(uView[0][1], uView[1][1], uView[2][1]);
    gl_Position = uProjection * uView * vec4(position.x, aPosition.y, position.z, 1.0);
}