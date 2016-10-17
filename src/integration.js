export default class Integration {
  constructor(params) {
    this.name = params.name;
    this.defaultContext = params.defaultContext;
    this.actions = params.actions;
  }

  action(actionName, actionData, actionContext) {
    if (!this.actions.hasOwnProperty(actionName)) {
      return Promise.reject(`${this.name}: action "${actionName}" not defined`);
    }
    return this.actions[actionName](actionData, actionContext);
  }
}
