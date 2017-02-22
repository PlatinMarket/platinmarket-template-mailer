<div class="container">
	<div class="row">
		<div class="col-lg-6 col-md-6">
			<h3 class="page-header">İşlem bilgileri</h3>
			<div class="panel panel-primary panel-jobs">
				<div class="panel-body">
					<div class="progress" style="margin-bottom:0;">
						<div class="progress-bar progress-bar-striped active" role="progressbar" style="width: 0%"></div>
					</div>
				</div>
				<!-- Status Zone -->
				<ul data-zone="status" class="list-group list-job"></ul>
				<!-- Status Zone -->
			</div>
		</div>
		<div class="col-lg-6 col-md-6">
			<h3 class="page-header">Gönderi bilgileri</h3>
			<div class="panel panel-default table-responsive">
				<table class="table table-bordered table-striped">
					<tbody>
						<tr>
							<th class="text-right">Kimden</th>
							<td>{{user.email}}</td>
						</tr>
						<tr>
							<th class="text-right">Kime</th>
							<td>{{to}}</td>
						</tr>
						<tr>
							<th class="text-right">Şablon</th>
							<td>{{template}}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
<!-- Step templates -->
<script id="template-step-1" type="text/x-handlebars-template">
    <li class="list-group-item text-primary">Gerekli bilgiler toplanıyor</li>
</script>
<script id="template-step-2" type="text/x-handlebars-template">
    <li class="list-group-item text-primary">Kuyruğa ekleniyor</li>
</script>
<script id="template-step-3" type="text/x-handlebars-template">
    <li class="list-group-item text-primary">Kuyrukta : <b>\{{subject}}</b></li>
</script>
<script id="template-step-4" type="text/x-handlebars-template">
    <li class="list-group-item text-primary">Tamamlandı : <b>\{{subject}}</b></li>
</script>
<script id="template-step-5" type="text/x-handlebars-template">
    \{{#if all_fail}}
    <li class="list-group-item text-danger" data-progress-class="danger"><b>Tüm görevler başarısızlıkla bitti</b></li>
    \{{else}}
        \{{#if all_success}}
            <li class="list-group-item text-success" data-progress-class="success"><b>Tümü başarıyla bitti</b></li>
        \{{else}}
            <li class="list-group-item text-success">\{{success_count}}/\{{total}} başarıyla bitti</li>
        \{{/if}}
    \{{/if}}
</script>

<!-- Step templates -->

<!-- Error step -->
<script id="template-error" type="text/x-handlebars-template">
    <li class="list-group-item list-group-item-warning" data-progress-class="danger"><b>Hata : \{{message}}</b></li>
</script>
<!-- Error step -->

<!-- Mail parameters -->
<form name="mail_data">
    {{#each params}}
        <input name="{{@key}}" value="{{this}}" type="hidden" />
    {{/each}}
</form>
<!-- Mail parameters -->

<script>
    var jobs = [];

    function wait(time, data) {
      return new Promise(resolve => {
        setTimeout(() => resolve(data), time)
      });
    }

    function setStatus(template, data) {
      return new Promise(resolve => {
        var status = $(Handlebars.compile($("#template-" + template).html())(data || {})).fadeOut(0);
		var status_number = template.replace("step-","")
		$(".progress-bar").css("width", status_number * 20 + "%");
        $("[data-zone='status']").append(status);
        status.slideDown(200, () => resolve(data));
		//console.log($(status).attr("data-progress-class"));
		if(status_number === "error") 
			$(".progress-bar").addClass("progress-bar-danger");
		else if(status_number === "5")
			var event_class = $(status).attr("data-progress-class");
			if(event_class){
				$(".progress-bar").removeClass("active").addClass("progress-bar-" + event_class);
				$(".panel-jobs").addClass("panel-" + event_class);
				$(".panel-jobs .list-group-item").addClass("text-" + event_class);
			}
      });
    }

    function buildUrl() {
        var query = [];
        query.push({ k: 'id', v: '{{template}}'});
        query.push({ k: 'from', v: '{{user.email}}'});
        query.push({ k: 'to', v: '{{to}}'});
        query.push({ k: 'guid', v: '{{guid}}'});
        return '/send?' + query.map(q => q.k + '=' + encodeURIComponent(q.v)).join('&');
    }

    function sendMail() {
      return new Promise((resolve, reject) => {
        var data = {};
        $("form[name='mail_data']").serializeArray().forEach(k => data[k.name] = k.value);
        $.post(buildUrl(), data).then(_jobs => {
          jobs = _jobs;
          resolve();
        }).catch(err => reject(err));
      });
    }

    function waitForComplate(job, step) {
      return new Promise((resolve, reject) => {
        var checking = false;
        var waiter = setInterval(() => {
          if (checking) return;
          checking = true;
          $.get('/job/detail/' + job.type + '/' + job.id).then(j => {
            if (j.stacktrace && j.stacktrace instanceof Array && j.stacktrace.length > 0) {
              job.success = false;
              clearInterval(waiter);
              return reject(new Error(job.subject + ": " + (j.stacktrace instanceof Array && j.stacktrace.length > 0 ? j.stacktrace[0].split("\n")[0] : (j.stacktrace ? j.stacktrace.split("\n")[0] : 'Bilinmeyen bir hata'))));
            }
            if (!j.returnvalue) {
              job.success = true;
              return checking = false;
            }
            setStatus(step, job).then(() => resolve());
          }).catch(err => {
            clearInterval(waiter);
            reject(err);
          });
        }, 1500);
      });
    }

    Promise.prototype.finally = function (callback) {
      let p = this.constructor;
      // We don’t invoke the callback in here,
      // because we want then() to handle its exceptions
      return this.then(
        // Callback fulfills: pass on predecessor settlement
        // Callback rejects: pass on rejection (=omit 2nd arg.)
        value  => p.resolve(callback()).then(() => value),
        reason => p.resolve(callback()).then(() => { throw reason })
      );
    };

    setStatus('step-1')
      .then(() => wait(200))

      // AddQueue
      .then(() => setStatus('step-2'))
      .then(() => wait(200))
      .then(() => sendMail())

      // InQueue
      .then(() => Promise.all(jobs.map(j => setStatus('step-3', j))))
      .then(() => wait(200))
      .then(() => Promise.all(jobs.map(j => waitForComplate(j, 'step-4'))))

      // Error
      .catch(err => {
        err = err || {};
        console.error(err);
        setStatus('error', { message: (err.responseJSON ? err.responseJSON.message : err.responseText) || (err instanceof Error ? err.message : 'Bilinmeyen hata!')});
      })

      // End
      .finally(() => setStatus('step-5', { jobs, all_success: !jobs.find(j => !j.success), all_fail: !jobs.find(j => j.success), success_count: jobs.filter(j => j.success).length, fail_count: jobs.filter(j => !j.success).length, total: jobs.length}));


</script>