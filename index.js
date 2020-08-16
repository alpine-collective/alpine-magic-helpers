function FunctionName() {
	Array.from(document.querySelectorAll('[x-data]')).forEach(alpineComponent => {
		console.log(alpineComponent)
	})
}

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function(callback) {
	AlpineAutoInit()
	alpine(callback)
}

module.exports = FunctionName