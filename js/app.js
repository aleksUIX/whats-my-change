$(function() {


		AppModel = Backbone.Model.extend({
			defaults: {
				price: 0,
				amount: 0,
				change: [],
				currency: [			
					5000,
					2000,
					1000,
					500,
					200,
					100,
					50,
					20,
					10,
					5,
					2,
					1
				],
				currencyNames: [
					'£50',
					'£20',
					'£10',
					'£5',
					'£2',
					'£1',
					'50p',
					'20p',
					'10p',
					'5p',
					'2p',
					'1p'
				]
			},
			
			validateMonetary: function(value) {
				if (isNaN(parseInt(value))) {
					return false;
				} else {
					return parseInt(value);
				}
			},
			
			convertToDecimal: function(value) {
				var separator = null;
				
				if (isNaN(parseInt(value))) {
					return false;
				}
				
				if (value.indexOf('.')>-1) {
					separator = '.';
				}
				if (value.indexOf(',')>-1) {
					separator = ',';
				}
				
				if (separator == null) {
					return parseInt(value)*100;
				}
				
				
				if (value.length-value.indexOf(separator) == 2) {
					return parseInt(value.replace(separator, '')*10);
				}
				if (value.length-value.indexOf(separator) == 3) {
					return parseInt(value.replace(separator, ''));
				}			
				
				return false;
			},
			
			recalculateChange: function(changeDue) {
				var price = this.price;
					amount = this.amount;
					currency = this.defaults.currency;
					changeCurrency = {};
					coinsCount = null;
					totalCount = null;
					totalChange = amount - price;
					
				var totalP = ((totalChange/100)-parseInt(totalChange/100)) > 0 ? ' and '+Math.round(((totalChange/100)-parseInt(totalChange/100))*100)+'p' : '';
				this.totalChange = '£'+parseInt(totalChange/100)+totalP;
					
				for (var unit in currency) {
					var multiplier = parseInt(changeDue / currency[unit]);
						tenderName = this.defaults.currencyNames[unit];
						
					if (multiplier > 0 ) {
						changeDue -= (currency[unit]*multiplier);
						changeCurrency[tenderName] = multiplier;
					}
					totalCount += multiplier;
					if (tenderName !== '£50' && tenderName !== '£20' && tenderName !== '£10' && tenderName !== '£5') {
						coinsCount += multiplier;
					}
					
					
				}
				
				this.tenderCategory = [
						['coins', coinsCount],
						['banknotes', totalCount-coinsCount]
					];
				this.tederTotal = totalCount;
				
				return changeCurrency;			
			},
			
			parseChangeHC: function(input) {
				var newArray = []
				
				for (var unit in input) {
					var newRow = [unit, input[unit]];
					newArray.push(newRow);
				}
				
				return newArray;
				
			}
			
		
		});
	
		
		var appModel = new AppModel();
		
		
		AppView = Backbone.View.extend({
			el: "#appContainer",
			
			model: appModel,
			
			events: {
				'change #params-price'	: 'recalculate',
				'change #params-amount'	: 'recalculate',
				'click #reset-app'		: 'resetFields'
			},
			
			initialize: function() {
			
			},
			
			render: function() {
			},
			
			recalculate: function(e) {
				var target = $(e.target);
					newVal = target.val();
					targetName = target.attr('id');
					changeObject = null;
					
				var decimalVal = this.model.convertToDecimal(newVal);
				decimalVal == false ? target.addClass('badValue') : target.removeClass('badValue');
				
				targetName == 'params-price' ? this.model.price = decimalVal : this.model.amount = decimalVal;
				
				if (this.model.price < this.model.amount) {
					$('#params-price').removeClass('badValue');
					$('#params-amount').removeClass('badValue');
					changeObject = this.model.recalculateChange(this.model.amount-this.model.price);
					
					this.renderChange(changeObject);
				} else {
					$('#params-price').addClass('badValue');
					$('#params-amount').addClass('badValue');
				}
				
			},
			
			renderChange: function(change) {
				var changeContainer = this.$el.find('#change-container');
					template = $('#template-change').html();
					
				changeContainer.hide();
				changeContainer.html(_.template(template, {change: change, totalChange: this.model.totalChange}));
				changeContainer.fadeIn(500);
				
				var dataHC = this.model.parseChangeHC(change);
				$('#change-chart-type').highcharts({
					chart: {
						plotBackgroundColor: null,
						plotBorderWidth: null,
						plotShadow: false
					},
					title: {
						text: 'tender type share'
					},
					tooltip: {
						pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
					},
					plotOptions: {
						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								color: '#000000',
								connectorColor: '#000000',
								format: '<b>{point.name}</b>: {point.percentage:.1f} %'
							},
							showInLegend: true
						}
					},
					series: [{
						type: 'pie',
						name: 'tender type share',
						data:  dataHC
					}]
				});
				
				
				$('#change-chart-category').highcharts({
					chart: {
						plotBackgroundColor: null,
						plotBorderWidth: null,
						plotShadow: false
					},
					title: {
						text: 'coins and banknotes share'
					},
					tooltip: {
						pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
					},
					plotOptions: {
						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								color: '#000000',
								connectorColor: '#000000',
								format: '<b>{point.name}</b>: {point.percentage:.1f} %'
							},
							showInLegend: true
						}
					},
					series: [{
						type: 'pie',
						name: 'coins and banknotes',
						data:  this.model.tenderCategory
					}]
				});
				
			},
			
			resetFields: function() {
				this.$el.find('#params-price').val('');
				this.$el.find('#params-amount').val('');
				this.$el.find('#change-container').html('');
				
				this.model.price = 0;
				this.model.amount = 0;
			}
			

		});
		
		
		AppRouter = Backbone.Router.extend({
		
		
		});
		
		var appRouter = new AppRouter();
	
		Backbone.history.start();
		
		var appView = new AppView();
});