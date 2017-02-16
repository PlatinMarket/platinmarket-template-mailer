<div class="container main-page">
	<div class="row">
		<div class="col-lg-3">
			{{#each departments}}
			<div class="department-zone">
				<h3 class="page-header">
					{{name}}
					<span class="label label-inverse pull-right">{{templates.length}}</span>
					<div class="clearfix"></div>
				</h3>
				<div class="panel panel-default">
					<div class="list-group">
						{{#each templates}}
						<a href="/template/{{folder}}/view" class="list-group-item" data-toggle="tooltip" data-placement="right" title="{{description}}">
							<h4 class="list-group-item-heading">{{name}}</h4>
							<p class="list-group-item-text ellipsis text-muted">{{description}}</p>
						</a>
					  {{/each}}
					</div>
				</div>
			</div>
			{{/each}}
			{{#if groups}}
			<div class="department-zone">
				<h3 class="page-header">
					Gruplar
					<span class="label label-inverse pull-right">{{groups.length}}</span>
					<div class="clearfix"></div>
				</h3>
				<div class="panel panel-default">
					<div class="list-group">
					   {{#each groups}}
					   <a href="/template/{{folder}}/view" class="list-group-item" data-toggle="tooltip" data-placement="right" title="{{templates}}">
							<h4 class="list-group-item-heading">{{name}}</h4>
							<p class="list-group-item-text ellipsis text-muted">{{templates}}</p>
						</a>
						{{/each}}
					</div>
				</div>
			</div>
			{{/if}}
		</div>
		<div class="col-lg-9">
			<div class="department-zone">
				<h3 class="page-header">Gönderiler</h3>
				<div class="row">
					<div class="col-lg-2">
						<div class="form-group">
							<select name="type" class="form-control selectpicker show-tick">
								<optgroup label="Gönderi tip">
									<option value="email" selected>E-posta</option>
								</optgroup>
							</select>
						</div>
					</div>
					<div class="col-lg-2">
						<div class="form-group">
							<select name="status" class="form-control selectpicker show-tick">
								<optgroup label="Gönderi durumu">
									<option value="completed" selected>Bitmiş</option>
									<option value="active">Aktif</option>
									<option value="failed">Başarısız</option>
									<option value="waiting">Sırada</option>
								</optgroup>
							</select>
						</div>
					</div>
					<div class="col-lg-8 text-right">
						<div class="form-group">
							<a class="btn btn-default"><span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span></a>
						</div>
					</div>
					<div class="clearfix"></div>
				</div>
				<div class="panel panel-default table-responsive">
					<table class="table table-striped table-hover">
						<thead>
							<tr>
								<th>Konu</th>
								<th>Kimden</th>
								<th>Kime</th>
								<th>Tarih</th>
							</tr>
						</thead>
						<tbody data-zone="jobs"></tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</div>

<link rel="stylesheet" type="text/css" href="/assets/bootstrap-select/dist/css/bootstrap-select.min.css" />
<script type="application/javascript" src="/assets/bootstrap-select/dist/js/bootstrap-select.min.js"></script>
<script type="application/javascript" src="/assets/moment/min/moment.min.js"></script>
<script type="application/javascript" src="/assets/moment/locale/tr.js"></script>
<script type="application/javascript" src="/assets/lodash/dist/lodash.min.js"></script>
<script id="template-job-item" type="text/x-handlebars-template">
	\{{#each jobs}}
		<tr data-job-id="\{{id}}">
			<td>
				<a href="javascript:showJobDetails(\{{id}});"><b>\{{subject}}</b></a>
			</td>
			<td>\{{from}}</td>
			<td>\{{to}}</td>
			<td class="text-muted">\{{fromNow timestamp}}</td>
		</tr>
		\{{else}}
		<tr>
			<td colspan="4" class="text-muted">Gönderi bulunamadı</td>
		</tr>
	\{{/each}}
</script>
<script>
  // MomentJS fromNow
  Handlebars.registerHelper("fromNow", function (date, suffix, options) {
    if (typeof suffix != "boolean") suffix = false;
    return new Handlebars.SafeString(moment(date).fromNow(false));
  });
</script>
<script>
	$("select[name='status'], select[name='type']")
	  	.on('change', (e) => {
	  	  	var status = $("select[name='status']")[0].value;
	  	  	var type = $("select[name='type']")[0].value || "email";
	  	  	if (!status || !type) return;

			$(e.target).trigger("loading.jobs");
			$.get('/job/list/' + status)
			  .then(list => renderList(_.head(_.map(list.filter(q => q.name == type), 'list'))))
			  .then(() => $(e.target).trigger("loaded.jobs"))
			  .catch(err => {
                $(e.target).trigger("loaded.jobs");
                toastr.error(err.responseJSON ? err.responseJSON.message : err.responseText);
                console.error(err.responseJSON || err.responseText || err);
			  });
		})
	  	.on('loading.jobs', (e) => {
		  $(e.target).prop('disabled', true);
		})
	    .on('loaded.jobs', (e) => {
          $(e.target).prop('disabled', false);
		})
	    .first().trigger("change");

	function renderList(jobs) {
	  jobs = _.sortBy(jobs, [j => (0 - j.timestamp)]);
	  return new Promise((resolve, reject) => {
	    setTimeout(() => {
          try {
            var template = Handlebars.compile($("#template-job-item").html());
            $("[data-zone='jobs']").html(template({ jobs }));
			resolve();
          } catch (err) {
            console.log(err);
            reject(err);
          }
		}, 0);
	  });
    }

    function showJobDetails(jobId) {
	  return new Promise((resolve, reject) => {
		$.get("/job/detail/email/" + jobId.toString()).then(job => {
          $("[data-zone='modal-body']").html(Handlebars.compile($("#template-job-modal").html())(job));
          $("#job-detail").modal();
          resolve();
		});
	  });
    }
	
	$('[data-toggle="tooltip"]').tooltip({
		trigger: 'hover',
		container: 'body',
		delay: {
			"show": 1000,
			"hide": 0
		}
	});
</script>


<div class="modal fade" id="job-detail" tabindex="-1" role="dialog">
	<div class="modal-dialog" role="document">
		<div class="modal-content" data-zone="modal-body"></div>
	</div>
</div>
<script id="template-job-modal" type="text/x-handlebars-template">
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
		<h4 class="modal-title">Gönderi bilgileri</h4>
	</div>
	<div class="modal-body">
		<div class="panel panel-default">
			<table class="table table-bordered table-striped">
				<tbody>
					<tr>
						<td>returnvalue.accepted</td>
						<td>\{{returnvalue.accepted}}</td>
					</tr>
					<tr>
						<td>returnvalue.envelope.from</td>
						<td>\{{returnvalue.envelope.from}}</td>
					</tr>
					<tr>
						<td>returnvalue.envelope.to</td>
						<td>\{{returnvalue.envelope.to}}</td>
					</tr>
					<tr>
						<td>returnvalue.rejected</td>
						<td>\{{returnvalue.rejected}}</td>
					</tr>
					<tr>
						<td>returnvalue.response</td>
						<td>\{{returnvalue.response}}</td>
					</tr>
					<tr>
						<td>stacktrace</td>
						<td>\{{stacktrace}}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</script>

