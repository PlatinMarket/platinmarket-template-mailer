<div class="container main-page">
	{{#each departments}}
	<div class="department-zone">
		<h3 class="page-header">{{name}}</h3>
		<div class="row">
			{{#each templates}}
			<div class="col-lg-3 col-md-4 col-sm-6">
				<a href="/template/{{folder}}/view" class="thumbnail" title="{{description}}">
					<div class="caption">
						<h4>{{name}}</h4>
						<p class="text-muted ellipsis">{{description}}</p>
					</div>
				</a>
			</div>
			{{/each}}
		</div>
	</div>
	{{/each}}
	{{#if groups}}
	<h3 class="page-header">Gruplar</h3>
	<div class="row">
		<div class="list-group">
		   {{#each groups}}
		   <div class="col-lg-3 col-md-4 col-sm-6">
				<a href="/template/group/view?name={{name}}" class="thumbnail" title="{{templates}}">
					<div class="caption">
						<h4>{{name}}</h4>
						<p class="text-muted ellipsis">{{templates}}</p>
					</div>
				</a>
			</div>
			{{/each}}
		</div>
	</div>
	{{/if}}
</div>

<div>
	<select name="type" class="form-control">
		<option value="email" selected="selected">E-Posta</option>
	</select>
	<select name="status" class="form-control">
		<option value="completed" selected="selected">Bitmiş</option>
		<option value="active">Aktif</option>
		<option value="failed">Başarısız</option>
		<option value="waiting">Sırada</option>
	</select>
	<table>
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

<script type="application/javascript" src="/assets/moment/min/moment.min.js"></script>
<script type="application/javascript" src="/assets/moment/locale/tr.js"></script>
<script type="application/javascript" src="/assets/lodash/dist/lodash.min.js"></script>
<script id="template-job-item" type="text/x-handlebars-template">
	\{{#each jobs}}
		<tr data-job-id="\{{id}}">
			<td><a href="#" onclick="showJobDetails(\{{id}});">\{{subject}}</a></td>
			<td>\{{from}}</td>
			<td>\{{to}}</td>
			<td>\{{fromNow timestamp}}</td>
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
</script>


<div class="modal fade" id="job-detail" tabindex="-1" role="dialog">
	<div class="modal-dialog" role="document">
		<div class="modal-content" data-zone="modal-body"></div>
	</div>
</div>
<script id="template-job-modal" type="text/x-handlebars-template">
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
		<h4 class="modal-title" id="myModalLabel">Modal title</h4>
	</div>
	<div class="modal-body">
		...
	</div>
	<div class="modal-footer">
		<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
		<button type="button" class="btn btn-primary">Save changes</button>
	</div>
</script>

