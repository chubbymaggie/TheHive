(function () {
    'use strict';

    angular.module('theHiveControllers')
        .controller('AdminReportTemplatesCtrl', AdminReportTemplatesCtrl)
        .controller('AdminReportTemplateDialogCtrl', AdminReportTemplateDialogCtrl);


    function AdminReportTemplatesCtrl($q, $modal, AnalyzerSrv, ReportTemplateSrv) {
        var self = this;

        this.templates = [];
        this.analyzers = [];


        this.load = function() {
            $q.all([
                ReportTemplateSrv.list(),
                AnalyzerSrv.query({
                    range: 'all'
                }).$promise
            ]).then(function (response) {
                self.templates = response[0].data;
                self.analyzers = response[1];

                var map = _.indexBy(self.analyzers, 'id');

                return $q.resolve(map);
            }).then(function (analyzersMap) {
                _.each(self.templates, function (tpl) {
                    _.each(tpl.analyzers, function (analyzerId) {
                        analyzersMap[analyzerId][tpl.flavor + 'Report'] = tpl;
                    });
                });

                console.log(self.analyzers);
            });
        };

        this.showTemplate = function (reportTemplate, analyzer) {
            var modalInstance = $modal.open({
                //scope: $scope,
                templateUrl: 'views/partials/admin/report-template-dialog.html',
                controller: 'AdminReportTemplateDialogCtrl',
                controllerAs: 'vm',
                size: 'max',
                resolve: {
                    reportTemplate: function () {
                        return reportTemplate;
                    },
                    analyzer: function () {
                        return analyzer;
                    }
                }
            });

            modalInstance.result.then(function() {
                self.load();
            });
        };

        this.load();
    };

    function AdminReportTemplateDialogCtrl($modalInstance, reportTemplate, ReportTemplateSrv, analyzer) {
        this.reportTemplate = reportTemplate;
        this.analyzer = analyzer;
        this.reportTypes = ['short', 'long'];
        this.editorOptions = {
            useWrapMode: true,
            showGutter: true,
            theme: 'default',
            mode: 'xml'
        };    

        this.formData = _.pick(reportTemplate, 'id', 'flavor', 'content');
        this.formData.analyzers = [this.analyzer.id];

        this.cancel = function () {
            $modalInstance.dismiss();
        };

        this.saveTemplate = function() {
            ReportTemplateSrv.save(this.formData)
                .then(function() {
                    $modalInstance.close();
                }, function(response) {
                    AlertSrv.error('AdminReportTemplateDialogCtrl', response.data, response.status);
                });
        };

        
    }
})();