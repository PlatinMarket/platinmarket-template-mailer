<nav class="navbar navbar-default navbar-fixed-top">
	<div class="container">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#top-menu" aria-expanded="false">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<div class="navbar-brand">PlatinBOX E-mails</div>
		</div>
		<div class="collapse navbar-collapse" id="top-menu">
			<ul class="nav navbar-nav">
				<li class="dropdown">
				  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Şablonlar <span class="caret"></span></a>
				  <ul class="dropdown-menu" data-zone="template-list"></ul>
				</li>
			</ul>
			<ul class="nav navbar-nav navbar-right">
				<li class="dropdown">
				  <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">{{user.email}} <span class="caret"></span></a>
				  <ul class="dropdown-menu">
					<li><a href="/logout">Oturumu kapat</a></li>
				  </ul>
				</li>
			</ul>
		</div>
	</div>
</nav>
<div class="container">
	<div class="row">
		<div class="col-lg-3 col-md-4">
			<p class="lead">Parametreler</p>
			<div class="panel panel-default">
				<div class="panel-body">
					<form>
					  <div class="form-group">
						<label for="exampleInputEmail1">Email address</label>
						<input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email">
					  </div>
					  <div class="form-group">
						<label for="exampleInputPassword1">Password</label>
						<input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
					  </div>
					  <div class="form-group">
						<label for="exampleInputEmail1">Email address</label>
						<input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email">
					  </div>
					  <div class="form-group">
						<label for="exampleInputPassword1">Password</label>
						<input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
					  </div>
					  <div class="form-group">
						<label for="exampleInputEmail1">Email address</label>
						<input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email">
					  </div>
					  <div class="form-group">
						<label for="exampleInputPassword1">Password</label>
						<input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
					  </div>
					  <hr/>
					  <button type="submit" class="btn btn-block btn-success">Kaydet & Önizle</button>
					</form>
				</div>
			</div>
		</div>
		<div class="col-lg-9 col-md-8">
			<div class="row">
				<div class="col-xs-4"><p class="lead">Önizleme</p></div>
				<div class="col-xs-8 text-right">
					<form>
						<div class="input-group">
							<input type="email" class="form-control" placeholder="Gönderilecek e-posta" required />
							<span class="input-group-btn">
								<button type="submit" class="btn btn-primary">Gönder</button>
							</span>
						</div>
					</form>
				</div>
			</div>
			<div class="panel panel-default">
				<div class="embed-responsive embed-responsive-4by3">
				  <iframe class="embed-responsive-item" src="/templates/blue2/"></iframe>
				</div>
			</div>
		</div>
	</div>
</div>