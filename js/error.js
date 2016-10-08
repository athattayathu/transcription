function ControllerError(message) {
     this.message = message;
     var last_part = new Error().stack.match(/[^\s]+$/);
     this.stack = `${this.name} at ${last_part}`;
}

Object.setPrototypeOf(ControllerError, Error);
ControllerError.prototype = Object.create(Error.prototype);
ControllerError.prototype.name = "ControllerError";
ControllerError.prototype.message = "";
ControllerError.prototype.constructor = ControllerError;
