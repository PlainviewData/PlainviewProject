const fs = require('fs');
const externalEditor = require('external-editor').ExternalEditor;

module.exports = function settings() {
	this.settingsFilePath = process.env.PLAINVIEW_CLI_SETTINGS_FILE_PATH;
	this.defaultSettings = {
		'plainview_url': '',
		'token': ''
	};
	this.requiredSettings = ['plainview_url'];
	this.loadedSettings = {};
	this.load = function(){
		if (fs.existsSync(this.settingsFilePath) == false) {
			console.error('Plainview URL not configured in settings! Run `plainview settings configure` to set');
			process.exit(1);
		}
		this.loadedSettings = JSON.parse(fs.readFileSync(this.settingsFilePath));
	};
	this.view = function(){
		if (fs.existsSync(this.settingsFilePath) == false) {
			console.error('Plainview URL not configured in settings! Run `plainview settings configure` to set');
			process.exit(1);
		}
		const settingsFileContents = JSON.parse(fs.readFileSync(this.settingsFilePath));
		console.log(settingsFileContents);
	};
	this.edit = function(){
		var userSettings;
		if (fs.existsSync(this.settingsFilePath) == false) {
			var editor = new externalEditor(JSON.stringify(this.defaultSettings));
			userSettings = JSON.parse(editor.run());
		} else {
			var currentContents = JSON.parse(fs.readFileSync(this.settingsFilePath));
			for (var attr in this.defaultSettings) {
				if (currentContents.hasOwnProperty(attr) == false){
					currentContents[attr] = this.defaultSettings[attr];
				}
			}
			var editor = new externalEditor(JSON.stringify(currentContents));
			userSettings = JSON.parse(editor.run());
		}
		var missingRequiredSettings = [];
		for (var i in this.requiredSettings){
			var requiredSetting = this.requiredSettings[i];
			if (userSettings.hasOwnProperty(requiredSetting) == false || userSettings[requiredSetting] == ''){
				missingRequiredSettings.push(requiredSetting);
			}
		}
		for (var i in missingRequiredSettings){
			var missingSettings = missingRequiredSettings[i];
			console.error('Required setting `%s` not set!', missingSettings);
		}
		fs.writeFileSync(this.settingsFilePath, JSON.stringify(userSettings));
	};
	this.setToken = function(token){
		var currentSettings = JSON.parse(fs.readFileSync(this.settingsFilePath, 'utf8'));
		currentSettings['token'] = token;
		fs.writeFileSync(this.settingsFilePath, JSON.stringify(currentSettings));
	}
};