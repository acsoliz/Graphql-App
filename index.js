import { gql, ApolloServer, UserInputError } from 'apollo-server';
import { v1 as uuid } from 'uuid';
import axios from 'axios';

const persons = [
	{
		name   : 'Alan',
		phone  : '1140856728',
		street : 'av. baja navarra',
		city   : 'Pamplona',
		id     : '3d594650-3436-11e9-bc57-8b80ba54c431'
	},
	{
		name   : 'Yourself',
		phone  : '15-40356728',
		street : 'av. full stack',
		city   : 'Barcelona',
		id     : '3d594670-3436-11e9-bc57-8b80ba54c431'
	},
	{
		name   : 'itza',
		street : 'av. challenge',
		city   : 'Ibiza',
		phone  : '15-40356728',
		id     : '3d594671-3436-11e9-bc57-8b80ba54c431'
	},
	{ name: 'Ana', street: 'av. challenge', city: 'Navarra', id: '3d594771-3436-11e9-bc57-8b80ba54c431' }
];

const typeDefs = gql`
	enum YesNo {
		YES
		NO
	}

	type Address {
		city: String
		street: String!
	}

	type Person {
		name: String!
		phone: String
		address: Address!
		id: ID!
	}

	type Query {
		personCount: Int!
		allPersons(phone: YesNo): [Person]!
		findPerson(name: String!): Person
	}

	type Mutation {
		addPerson(
			name: String!
			phone: String
			street: String!
			city: String!
		): Person
		editNumber(
			name: String!
			 phone: String!
		): Person
	}
`;
const resolvers = {
	Query    : {
		personCount : () => persons.length,
		allPersons  : async (root, args) => {
			// const { data: personsFromRestApi } = await axios.get('http://localhost:3000/persons/');
			if (!args.phone) return persons;

			// return persons.filter(person => {
			// 	args.phone === 'YES' ? person.phone :
			// 	!person.phone;
			// })

			const byPhone = (person) =>

					args.phone === 'YES' ? person.phone :
					!person.phone;
			return persons.filter(byPhone);
		},
		findPerson  : (root, args) => {
			const { name } = args;
			return persons.find((person) => person.name === name);
		}
	},
	Mutation : {
		addPerson  : (root, args) => {
			if (persons.find((p) => p.name === args.name)) {
				throw new UserInputError('must be a unique person', {
					invalidArgs : args.name
				});
			}

			// const {name, phone, street, city} = args
			const person = { ...args, id: uuid() };
			persons.push(person); //update database whith new person
			return person;
		},
		editNumber : (root, args) => {
			const personIndex = persons.findIndex((p) => p.name === args.name);
			if (!personIndex === -1) return null;
			const person = persons[personIndex];
			const updatePerson = { ...person, phone: args.phone };
			persons[personIndex] = updatePerson;
			return updatePerson;
		}
	},
	Person   : {
		address : (root) => {
			return {
				street : root.street,
				city   : root.city
			};
		}
		//  `${root.street}, ${root.street}`,
	}
};

const server = new ApolloServer({
	typeDefs  : typeDefs,
	resolvers : resolvers
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
