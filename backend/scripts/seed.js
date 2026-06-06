const mongoose = require('mongoose');
const env = require('../src/config/env');
const Builder = require('../src/models/Builder');
const Customer = require('../src/models/Customer');
const Project = require('../src/models/Project');

async function seed() {
  await mongoose.connect(env.mongoUri);

  const username = 'demo_builder';
  let builder = await Builder.findOne({ username }).select('+passwordHash');
  if (!builder) {
    builder = new Builder({
      name: 'Demo Builder',
      username,
      companyName: 'B2C Demo Construction'
    });
    builder.password = 'demo_builder_123456';
    await builder.save();
  }

  const code = '9823456712';
  let customer = await Customer.findOne({ projectCode: code });
  if (!customer) {
    customer = await Customer.create({
      name: 'Demo Customer',
      phone: code,
      projectCode: code
    });
  }

  let project = await Project.findOne({ code });
  if (!project) {
    project = await Project.create({
      code,
      title: 'Demo Villa Construction',
      builder: builder._id,
      customer: customer._id,
      address: 'Demo Site'
    });
  }

  console.log('Seed complete');
  console.log('Builder username: demo_builder');
  console.log('Builder password: demo_builder_123456');
  console.log('Customer project code: 9823456712');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
