class NotificationHandler{
	constructor(){
		
	}

	notifyError(error){
		var options = {}
		if(error instanceof ControllerError){
			options.message = ControllerError.message
		} else {
			options.message = error
		}

		$.notify(options,{
				// settings
				type: 'danger',
				placement: {
					from: "bottom",
					align: "left"
				}
			});
	}

	notifyMessage(message) {
		$.notify({
				// options
				message: message 
			},{
				// settingsa
				type: 'success',
				placement: {
					from: "bottom",
					align: "left"
				}
			});
	}

}