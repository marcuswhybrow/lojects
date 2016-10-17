import { isSubset } from './utils';

export default class Manager {
  constructor(params) {
    this.name = params.name;
    this.actions = params.actions;
    this.record = params.record;
    this.integration = {
      type: params.integration.type,
      context: params.integration.type.defaultContext,
    };

    Object.keys(params.integration.context).forEach(key => {
      this.integration.context[key] = params.integration.context[key];
    });
  }

  assertPermissable(actor, actionName) {
    // Mocking a request to permissions service
    return Promise.resolve();
  }

  action(actor, actionName, actionParams) {
    if (!this.actions.hasOwnProperty(actionName)) {
      return Promise.reject(`${this.name}: action "${actionName}" not defined`);
    }

    const rejectIfNotPermissible = isPermissable => {
      if (!isPermissable) return Promise.reject(
        `${this.name}: Failed permission check for actor on "${actionName}" ` +
        `action`
      );
    }
    const callIntegration = integrationParams => {
      // Enforces data integrity
      if (!isSubset(integrationParams, record)) {
        throw new Error(
          `${this.name}: Integration parameters for "${actionName}" must be a `
          `subset of this.record`
        );
      }
      return this.integration.type.action(
        actionName,
        integrationParams,
        this.integration.context
      );
    }
    const getIntegrationData = () => {
      return this.actions[actionName].request(actionParams);
    }
    const parseIntegrationData = data => {
      return this.actions[actionName].response(data);
    }

    return this.assertPermissable(actor, actionName)
      .then(getIntegrationData)
      .then(callIntegration)
      .then(parseIntegrationData);
  }

  create(actor, params) { return this.action(actor, 'create', params); }
  get(actor, params) { return this.action(actor, 'get', params); }
  update(actor, params) { return this.action(actor, 'update', params); }
  delete(actor, params) { return this.action(actor, 'delete', params); }
}
