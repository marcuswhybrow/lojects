import AWS from 'aws-sdk';
import { Integration } from '..';
import { AttributeValue as attr } from 'dynamodb-data-types';

const dynamodb = new AWS.DynamoDB();

function _flatten(obj, prefix) {
  return Object.keys(obj).map(key => {
    const val = obj[key];
    if (isObject(val)) {
      return _flatten(val, `${prefix}.${key}`)
    }
    let ret = {};
    ret[`${prefix}.${key}`] = val;
    return ret;
  }).reduce((obj, currentArray) => {
    Object.keys(currentArray).forEach(key => {
      obj[key] = currentArray[key];
    });
    return obj;
  }, {});
}

function flatten(obj) {
  let results = _flatten(obj, '');
  Object.keys(results).forEach(key => {
    results[key.substring(1)] = results[key];
    delete results[key];
  });
  return results;
}

export default new Integration({
  name: 'DynamoDB',
  defaultContext: { idAttrName: 'id' },
  actions: {
    create: (data, context) => {
      return dynamodb.putItem({
        Item: attr.wrap(data),
        TableName: context.tableName,
        ConditionExpression: `attribute_not_exists (${context.idAttrName})`
      }).promise().then(() => data)
    },

    get: (data, context) => {
      let key = {};
      key[context.idAttrName] = data[context.idAttrName];
      return dynamodb.getItem({
        Key: attr.wrap(key),
        TableName: context.tableName
      }).promise().then(data => attr.unwrap(data.Item));
    },

    update: (data, context) => {
      // Extract id from data to use as the update key
      let key = {};
      key[context.idAttrName] = attr.wrap(data[context.idAttrName]);
      delete data[context.idAttrName];

      // build update expression & attribute values
      let updateExpression = '';
      let attrValues = {};
      Object.keys(flatten(data)).forEach((nestedAttrName, index) => {
        updateExpression += `SET ${nestedAttrName} = :val${index}, `;
        attrValues[`:val${index}`] = attr.wrap(data[nestedAttrName]);
      });

      // Remove trailing comma
      const expLen = updateExpression.length;
      if (expLen >= 2) {
        updateExpression = updateExpression.substring(0, expLen - 2);
      }

      // call dynamodb
      return dynamodb.getItem({
        Key: attr.wrap(key),
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: attrValues,
        TableName: context.tableName,
        ReturnValues: 'ALL_NEW',
        ConditionExpression: `attribute_exists (${context.idAttrName})`
      }).promise().then(data => attr.unwrap(data.Item));
    }
  },
});
