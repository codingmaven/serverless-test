require('dotenv/config');

const { UserSeeder } = require('./user.seeder');
const { DynamoDB } = require('aws-sdk');
const { DocumentClient } = DynamoDB;
const usersData = require('./users-test-data.json');

const dynamo = new DynamoDB({
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const doclient = new DocumentClient({ service: dynamo });
const userSeeder = new UserSeeder(dynamo, doclient);

const log = (...mgs) => console.log('>>', ...mgs);

const seedContacts = async () => {
  log(`Checking if 'users' table exists`);

  const exists = await userSeeder.hasTable();

  if (exists) {
    log(`Table 'users' exists, deleting`);
    await userSeeder.deleteTable();
  }

  log(`Creating 'users' table`);
  await userSeeder.createTable();

  log('Seeding data');
  await userSeeder.seed(usersData);
};

seedContacts()
  .then(() => log('Done!'))
  .catch(err => console.log(err));
