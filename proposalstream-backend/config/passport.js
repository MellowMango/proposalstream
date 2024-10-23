// proposalstream-backend/config/passport.js

import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';

const options = {
  identityMetadata: `https://${process.env.AZURE_TENANT_NAME}.b2clogin.com/${process.env.AZURE_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_POLICY}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID,
  validateIssuer: true,
  issuer: `https://${process.env.AZURE_TENANT_NAME}.b2clogin.com/${process.env.AZURE_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_POLICY}/v2.0/`,
  passReqToCallback: false,
  allowMultiAudiencesInToken: false,
  audience: process.env.AZURE_CLIENT_ID,
  loggingLevel: 'info',
  scope: ['openid', 'profile', 'email'],
};

const bearerStrategy = new BearerStrategy(options, (token, done) => {
  // Perform any additional validations or retrieve user information if needed
  return done(null, token, token);
});

passport.use(bearerStrategy);

export default passport;
