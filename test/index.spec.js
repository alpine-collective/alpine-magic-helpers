const FunctionName = require('../index')

test('Sample test', () => {
	document.body.innerHTML = `<div x-data="{}"></div>`
	FunctionName()
	expect(document.querySelector('div').getAttribute('x-data')).toEqual("{}")
})
