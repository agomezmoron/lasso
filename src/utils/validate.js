/**
 * Copyright 2020 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **/

const Joi = require('joi');

/**
 * Validator for audit requests
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function auditRequestValidation(req, res, next) {
  if(req.header('content-type') != 'application/json') {
      console.log('Request header content-type is NOT application/json and MANUALLY parsing the req body as json');
      try {
          req.body = JSON.parse(req.body);
      } catch (e) {
          ;
      }
  }
  const schema = Joi.object({
    mode: Joi.string(),
    engine: Joi.string(),
    urls: Joi.array().required().min(1).max(20),
    blockedRequests: Joi.array(),
    storeData: Joi.boolean()
  });

  validateRequest(req, res, next, schema);
}

/**
 * Validator for async audit requests
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function asyncAuditRequestValidation(req, res, next) {
  const schema = Joi.object({
    mode: Joi.string(),
    urls: Joi.array().required().min(1).max(1000),
    engine: Joi.string(),
    blockedRequests: Joi.array(),
    storeData: Joi.boolean()
  });

  validateRequest(req, res, next, schema);
}

/**
 * Validator for active tasks listing request
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function activeTasksRequestValidation(req, res, next) {
  const schema = Joi.object({
    pageSize: Joi.number(),
    pageToken: Joi.string(),
  });

  validateRequest(req, res, next, schema);
}

/**
 * Runs the request validation
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @param {Object} schema
 * @return {*}
 */
function validateRequest(req, res, next, schema) {
  const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  };
  const {error, value} = schema.validate(req.body, options);
  if (error) {
    const errors = error.details.map((x) => x.message).join(', ');

    res.status(500);
    return res.json({
      'error': {
        'code': 500,
        'message': errors,
      },
    });
  } else {
    req.body = value;
    next();
  }
}

module.exports = {
  auditRequestValidation,
  asyncAuditRequestValidation,
  activeTasksRequestValidation,
};
