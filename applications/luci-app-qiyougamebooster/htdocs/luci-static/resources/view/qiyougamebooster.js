// SPDX-License-Identifier: Apache-2.0

'use strict';
'require form';
'require poll';
'require rpc';
'require uci';
'require view';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});

function getServiceStatus() {
	return L.resolveDefault(callServiceList('qiyougamebooster'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['qiyougamebooster']['instances']['qiyougamebooster']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var spanTemp = '<span style="color:%s"><strong>%s %s</strong></span>';
	var renderHTML;
	if (isRunning) {
		renderHTML = spanTemp.format('green', _('QiYou Game Booster'), _('RUNNING'))
	} else {
		renderHTML = spanTemp.format('red', _('QiYou Game Booster'), _('NOT RUNNING'));
	}
 
	return renderHTML;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('qiyougamebooster')
		]);
	},

	render: function() {
		let m, s, o;

		m = new form.Map('qiyougamebooster', _('QiYou Game Booster'),
			_('Play console games online with less lag and more stability.') + '<br />' + 
			_('— now supporting PS, Switch, Xbox, PC, and mobile.'));

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			poll.add(function () {
				return L.resolveDefault(getServiceStatus()).then(function (res) {
					var view = document.getElementById('service_status');
					view.innerHTML = renderStatus(res);
				});
			});

			return E('div', { class: 'cbi-section', id: 'status_bar' }, [
					E('p', { id: 'service_status' }, _('Collecting data...'))
			]);
		}

		s = m.section(form.NamedSection, 'config', 'qiyougamebooster');

		o = s.option(form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.rmempty = false;

		s = m.section(form.TypedSection);
		s.anonymous = true;
		s.render = function () {
			return E('div', {class: 'cbi-section'}, [
				E('p', [
					E('img', {src: '/qiyougamebooster/Tutorial.png', height: '350'})
				])
			])
		}


		return m.render();
    }

});
