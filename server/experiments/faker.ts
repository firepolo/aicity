import { faker } from "@faker-js/faker";

for (let i = 0; i < 3; ++i) {
	console.log({
		firstname: faker.person.firstName(),
		lastname: faker.person.lastName(),
		sex: faker.person.sex(),
		age: faker.number.int({ min: 20, max: 70 }),
		job: faker.person.jobTitle(),
		zodiac: faker.person.zodiacSign(),
		haircolor: faker.color.human(),
		eyecolor: faker.color.human()
	});
}