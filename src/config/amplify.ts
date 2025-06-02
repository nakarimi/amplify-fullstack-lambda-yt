import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION,
  aws_appsync_graphqlEndpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT,
  aws_appsync_region: process.env.NEXT_PUBLIC_AWS_REGION,
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
