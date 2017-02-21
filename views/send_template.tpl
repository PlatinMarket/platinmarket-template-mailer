
<!-- Status Zone -->
<ul data-zone="status"></ul>
<!-- Status Zone -->

<!-- Step templates -->
<script id="template-step-1" type="text/x-handlebars-template">
    <li>Gerekli bilgiler toplanıyor</li>
</script>
<script id="template-step-2" type="text/x-handlebars-template">
    <li>Kuyruğa ekleniyor</li>
</script>
<script id="template-step-3" type="text/x-handlebars-template">
    <li>Kuyrukta: \{{subject}}</li>
</script>
<script id="template-step-4" type="text/x-handlebars-template">
    <li>Tamamlandı: \{{subject}}</li>
</script>
<script id="template-step-5" type="text/x-handlebars-template">
    <li>Bitti</li>
</script>
<!-- Step templates -->

<!-- Error step -->
<script id="template-error" type="text/x-handlebars-template">
    <li>Hata: \{{message}}</li>
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
        $("[data-zone='status']").append(status);
        status.fadeIn(200, () => resolve(data));
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
            if (!j.returnvalue) return checking = false;
            setStatus(step, job).then(() => resolve());
          }).catch(err => {
            clearInterval(waiter);
            reject(err);
          });
        }, 1500);
      });
    }

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

      // End
      .then(() => setStatus('step-5', jobs))

      // Error
      .catch(err => {
        err = err || {};
        console.error(err);
        setStatus('error', { message: (err.responseJSON ? err.responseJSON.message : err.responseText) || "Bilinmeyen hata!"});
      });


</script>