<!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>

<!-- Define Charset -->
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<!-- Responsive Meta Tag -->
<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />

    <title>Mailto - Responsive Email Template</title><!-- Responsive Styles and Valid Styles -->
	<link href='http://fonts.googleapis.com/css?family=PT+Sans:400,700' rel='stylesheet' type='text/css'>
	
    <style type="text/css">
    
    	
	    body{
            width: 100%; 
            background-color: #f0f0f0; 
            margin:0; 
            padding:0; 
            -webkit-font-smoothing: antialiased;
        }
        
        p,h1,h2,h3,h4,img{
	        margin-top:0;
			margin-bottom:0;
			padding-top:0;
			padding-bottom:0;
        }
        
        span.preheader{display: none; font-size: 1px;}
        
        html{
            width: 100%; 
        }
        
        table{
            font-size: 14px;
            border: 0;
        }
        
        /* ----------- responsivity ----------- */
        @media only screen and (max-width: 640px){
			/*------ top header ------ */
			.view-online{font-size: 12px !important;}
            .main-header{line-height: 28px !important; font-size: 17px !important;}
            .main-subheader{line-height: 28px !important;}
            
			/*----- main image -------*/
			.main-image{width: 440px !important; height: auto !important;}
			
			/*-------- container --------*/			
			.container600{width: 440px !important;}
			.container560{width: 400px !important;}
			
			/*-------- divider --------*/			
			.divider{width: 440px !important; height: 1px !important;}
			
			/*----- banner -------*/
			.banner{width: 400px !important; height: auto !important;}
			/*-------- secions ----------*/
			.section-item{width: 400px !important;}
            .section-img{width: 400px !important; height: auto !important;}
			           
			/*-------- footer ------------*/
			.unsubscribe{line-height: 26px !important; font-size: 13px !important;}
			.copy{line-height: 26px !important; font-size: 14px !important;}
			.hide-iphone{display: none !important;}
			.vertical-spacing{width: 400px !important;}		
			.footer-item{width: 200px !important;}
		}
		
		@media only screen and (max-width: 479px){
			
			/*------ top header ------ */
			.view-online{font-size: 12px !important;}
            .main-header{line-height: 28px !important; font-size: 15px !important;}
            .main-subheader{line-height: 28px !important;}
            .logo{width: 280px !important;}
            .nav{width: 280px !important;}
			/*----- main image -------*/
			.main-image{width: 280px !important; height: auto !important;}
			
			/*-------- container --------*/			
			.container600{width: 280px !important;}
			.container560{width: 240px !important;}
			
			/*-------- divider --------*/			
			.divider{width: 280px !important; height: 1px !important;}
			
			/*----- banner -------*/
			.banner{width: 240px !important; height: auto !important;}
			/*-------- secions ----------*/
			.section-item{width: 240px !important;}
            .section-img{width: 240px !important; height: auto !important;}
			           
			/*-------- footer ------------*/
			.unsubscribe{line-height: 26px !important; font-size: 13px !important;}
			.copy{line-height: 26px !important; font-size: 14px !important;}
			.hide-iphone{display: block !important;}
			.vertical-spacing{width: 240px !important;}		
			.footer-item{width: 240px !important;}
			
			
		}
		
	</style>
</head>

<body leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">

	<!--======= preheader ======-->
	<span class="preheader">Mailto Responsive Email Template<br/></span>
	<!--======= end preheader ======-->
	
	<table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="f0f0f0">
	
		<tr><td height="47"></td></tr>
		
		<!-------------- top header ------------->
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" align="center" cellspacing="0" border="0" class="container600">
					<tr>
						<td align="center">
							<table border="0" align="left" cellpadding="0" cellspacing="0" class="logo">
	                			<tr>
	                				<td align="center">
	                					<a href="" style="display: block; width: 200px; height: 28px; border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="logo" width="200" height="28" border="0" style="display: block; width: 200px; height: 28px" src="http://promailthemes.com/mailto/layout1/white/blue2/img/logo.png" alt="logo" /></a>
	                				</td>
	                			</tr>
	                		</table>
	                		
	                		<table border="0" align="left" cellpadding="0" cellspacing="0" class="nav">
	                			<tr>
	                				<td height="20" width="20"></td>
	                			</tr>
	                		</table>
	                		
	                		<table border="0" align="right" cellpadding="0" cellspacing="0" class="nav">
			        			<tr><td height="5"></td></tr>
			        			<tr>
			        				<td align="center" mc:edit="view-online" style="font-size: 13px; font-family: Helvetica, Arial, sans-serif;">
			        					<table border="0" cellpadding="0" cellspacing="0" class="date">
			                				<tr>
					                    		
					                    		<td mc:edit="tel" style="color: #8c8c8c; font-size: 14px; font-family: 'PT Sans', Arial, sans-serif;" class="view-online">
					                    			<singleline>
						                    			 TROUBLESHOOT ? <a href="" style="color: #0a8ccd; text-decoration: none;">VIEW IT ONLINE</a>
													</singleline>	
					                    		</td>
					                    	</tr>
												
			                			</table>
			        				</td>
			        			</tr>
			        		</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<!-------------- end top header ------------->
		
		<tr><td height="45"></td></tr>
		
		<!-------------- main image ------------->
		<repeater>
		<layout label="main-section">
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" align="center" cellspacing="0" border="0" class="container600">
					<tr>
						<td align="center">
				        	<img editable="true" mc:edit="main-image" src="http://promailthemes.com/mailto/layout1/white/blue2/img/main-image.png" style="display: block; width: 600px; height: 320px;" width="600" height="320" border="0" alt="main image" class="main-image" />
				        </td>
					</tr>
				</table>
			</td>
		</tr>
		<!-------------- end main image ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="45">&nbsp;</td></tr>
				</table>
			</td>
		</tr>
		
		<!-------------- main text ------------->
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr>
        				<td align="center">
        					<table border="0" width="560" align="center" cellpadding="0" cellspacing="0" class="container560">
        						<tr>
        							<td align="center" mc:edit="main-header" style="color: #596064; font-size: 23px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;" class="main-header">
			        					<multiline>
			        						{{e-posta_adresi}} / HEADLINE INTRODUCTION HERE
			        					</multiline>
			        				</td>	
        						</tr>
        						<tr><td height="25"></td></tr>
        						<tr>
        							<td align="center" mc:edit="main-subheader" style="color: #8c8c8C; font-size: 15px; font-family: 'PT Sans', Arial, sans-serif; line-height: 36px;" class="main-subheader">
        								<multiline>
        									Lorem ipsum dolor sit amet, consectetur <a href="" style="color: #0a8ccd; text-decoration: none;">adipiscing elit.</a> Sed in bibendum nunc, sit amet euismod mi. Vivamus eleifend porta ante id ultricies. 
        								</multiline>
        							</td>
        						</tr>
        					</table>			
        				</td>
        			</tr>
				</table>
			</td>
		</tr>
		<!-------------- end main text ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="35"></td></tr>
				</table>
			</td>
		</tr>
		</layout>
		
		<!-------------- divider ------------->
		<layout label="divider">
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr>
						<td>
							<img editable="false" mc:edit="divider" src="http://promailthemes.com/mailto/layout1/white/blue2/img/divider.png" style="display: block; width: 600px; height: 1px;" width="600" height="1" border="0" alt="divider" class="divider" />
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<!-------------- end divider ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="45"></td></tr>
				</table>
			</td>
		</tr>
		</layout>
		
		<!-------------- features ------------->
		<layout label="features">
		<tr>
			<td align="center">
				<table border="0" width="600" align="center" cellpadding="0" bgcolor="ffffff" cellspacing="0" class="container600">
					
					<tr>
						
        				<td>
        					<table border="0" width="560" align="center" cellpadding="0" cellspacing="0" class="container560">
        						<tr>
        							<td>
        					
			        					<table border="0" width="170" align="left" cellpadding="0" cellspacing="0" class="section-item">
											<tr>
												<td align="center">
													<a href="" style=" border-style: none !important; width: 66px; display: block; border: 0 !important;"><img editable="true" mc:edit="feature-image1" src="http://promailthemes.com/mailto/layout1/white/blue2/img/feature-img1.png" style="display: block; width: 66px; height: 66px;" width="66" height="66" border="0" alt="feature image1" class="feature-img"/></a>
												</td>
											</tr>
											
											<tr><td height="25"></td></tr>
											
											<tr>
			        							<td align="center" mc:edit="feature-title1" style="color: #4e4e4e; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
						        					<multiline>
						        						RESPONSIVE LAYOUT
						        					</multiline>
						        				</td>	
			        						</tr>
			        						
			        						<tr><td height="10"></td></tr>
			        						
			        						<tr>
			        							<td align="center" mc:edit="feature-subtitle1" style="color: #8c8c8c; font-size: 13px; font-family: 'PT Sans', Arial, sans-serif; line-height: 24px;">
			        								<multiline>
			        									Lorem ipsum dolor sit ametconsectetuelit. 
			        								</multiline>
			        							</td>
			        						</tr>
											
											
										</table>
										
										<table border="0" width="25" align="left" cellpadding="0" cellspacing="0">
											<tr><td width="25" height="40"></td></tr>
										</table>
										
										<table border="0" width="170" align="left" cellpadding="0" cellspacing="0" class="section-item">
											<tr>
												<td align="center">
													<a href="" style=" border-style: none !important; width: 66px; display: block; border: 0 !important;"><img editable="true" mc:edit="feature-image2" src="http://promailthemes.com/mailto/layout1/white/blue2/img/feature-img2.png" style="display: block; width: 66px; height: 66px;" width="66" height="66" border="0" alt="feature image2" class="feature-img"/></a>
												</td>
											</tr>
											
											<tr><td height="25"></td></tr>
											
											<tr>
			        							<td align="center" mc:edit="feature-title2" style="color: #4e4e4e; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
						        					<multiline>
						        						RESPONSIVE LAYOUT
						        					</multiline>
						        				</td>	
			        						</tr>
			        						
			        						<tr><td height="10"></td></tr>
			        						
			        						<tr>
			        							<td align="center" mc:edit="feature-subtitle2" style="color: #8c8c8c; font-size: 13px; font-family: 'Oxygen', Arial, sans-serif; line-height: 24px;">
			        								<multiline>
			        									Lorem ipsum dolor sit ametconsectetuelit. 
			        								</multiline>
			        							</td>
			        						</tr>
											
											
										</table>
										
										<table border="0" width="25" align="left" cellpadding="0" cellspacing="0">
											<tr><td width="25" height="40"></td></tr>
										</table>
										
										<table border="0" width="170" align="left" cellpadding="0" cellspacing="0" class="section-item">
											<tr>
												<td align="center">
													<a href="" style=" border-style: none !important; width: 66px; display: block; border: 0 !important;"><img editable="true" mc:edit="feature-image3" src="http://promailthemes.com/mailto/layout1/white/blue2/img/feature-img3.png" style="display: block; width: 66px; height: 66px;" width="66" height="66" border="0" alt="feature image3" class="feature-img"/></a>
												</td>
											</tr>
											
											<tr><td height="25"></td></tr>
											
											<tr>
			        							<td align="center" mc:edit="feature-title3" style="color: #4e4e4e; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
						        					<multiline>
						        						RESPONSIVE LAYOUT
						        					</multiline>
						        				</td>	
			        						</tr>
			        						
			        						<tr><td height="10"></td></tr>
			        						
			        						<tr>
			        							<td align="center" mc:edit="feature-subtitle3" style="color: #8c8c8c; font-size: 13px; font-family: 'PT Sans', Arial, sans-serif; line-height: 24px;">
			        								<multiline>
			        									Lorem ipsum dolor sit ametconsectetuelit. 
			        								</multiline>
			        							</td>
			        						</tr>
											
										</table>
        							</td>
        						</tr>
        					</table>
        					
        				</td>
					</tr>
				</table>
			</td>
		</tr>
		<!-------------- end features ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="45"></td></tr>
				</table>
			</td>
		</tr>
		</layout>
				
		<!------- 2columns ------->
		<layout label="2col image and text">
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="ffffff" class="container600">
					<tr>
						<td>
							<table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="container560">
								<tr>
				    				<td>	
										<!------- section1 ------->
										<table border="0" width="260" align="left" cellpadding="0" cellspacing="0" class="section-item">
											<tr>
												<td>
													<a href="" style="border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="image1" src="http://promailthemes.com/mailto/layout1/white/blue2/img/med-image1.png" style="display: block; width: 260px; height: 170px;" width="260" height="170" border="0" alt="section image" class="section-img"/></a>
												</td>
											</tr>
											
											<tr><td height="36"></td></tr>
											
											<tr>
				    							<td align="center" mc:edit="title1" style="color: #4e4e4e; font-size: 16px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;"  class="main-header">
						        					<multiline>
						        						YOUR TITLE / HEADLINE HERE
						        					</multiline>
						        				</td>	
				    						</tr>
				    						
				    						<tr><td height="15"></td></tr>
				    						
				    						<tr>
				    							<td align="center" mc:edit="text1" style="color: #8c8c8c; font-size: 15px; font-family: 'PT Sans', Arial, sans-serif; line-height: 36px;">
				    								<multiline>
				    									Lorem ipsum dolor sit amet consectetur  sed in bibendum nunc sit amet euismod 
				    								</multiline>
				    							</td>
				    						</tr>
											
											<tr><td height="20"></td></tr>
											
											<tr>
												<td align="center">
													<a href="" style="display: block; width: 113px; border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="readMoreBtn" width="113" height="32" border="0" style="display: block; width: 113px; height: 32px;" src="http://promailthemes.com/mailto/layout1/white/blue2/img/readmore-btn.png" alt="read more" /></a>
												</td>
											</tr>
										</table><!------- end section1 ------->
										
										<table border="0" width="40" align="left" cellpadding="0" cellspacing="0">
											<tr><td width="40" height="40"></td></tr>
										</table>
										
										<!------- section2 ------->
										<table border="0" width="260" align="left" cellpadding="0" cellspacing="0" class="section-item">
											<tr>
												<td>
													<a href="" style="border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="image2" src="http://promailthemes.com/mailto/layout1/white/blue2/img/med-image2.png" style="display: block; width: 260px; height: 170px;" width="260" height="170" border="0" alt="section image" class="section-img"/></a>
												</td>
											</tr>
											
											<tr><td height="36"></td></tr>
											
											<tr>
				    							<td align="center" mc:edit="title2" style="color: #4e4e4e; font-size: 16px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;" class="main-header">
						        					<multiline>
						        						YOUR TITLE / HEADLINE HERE
						        					</multiline>
						        				</td>	
				    						</tr>
				    						
				    						<tr><td height="15"></td></tr>
				    						
				    						<tr>
				    							<td align="center" mc:edit="text2" style="color: #8c8c8c; font-size: 15px; font-family: 'PT Sans', Arial, sans-serif; line-height: 36px;">
				    								<multiline>
				    									Lorem ipsum dolor sit amet consectetur  sed in bibendum nunc sit amet euismod 
				    								</multiline>
				    							</td>
				    						</tr>
											
											<tr><td height="20"></td></tr>
											
											<tr>
												<td align="center">
													<a href="" style="display: block; width: 113px; border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="readMoreBtn" width="113" height="32" border="0" style="display: block; width: 113px; height: 32px;" src="http://promailthemes.com/mailto/layout1/white/blue2/img/readmore-btn.png" alt="read more" /></a>
												</td>
											</tr>
										</table><!------- end section2 ------->
										
									</td>		
								</tr>
							</table>	
						</td>	
					</tr>
				</table>
			</td>
		</tr>
		<!------- end 2columns ------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="45"></td></tr>
				</table>
			</td>
		</tr>
		</layout>
		
		<!-------------- banner ------------->
		<layout label="banner">
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="ffffff" class="container600">
					<tr>
						<td>
							<table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="container560">
								<tr>
									<td>
										<img editable="true" mc:edit="banner" src="http://promailthemes.com/mailto/layout1/white/blue2/img/banner.png" style="display: block; width: 560px; height: 128px;" width="560" height="128" border="0" alt="banner" class="banner" />
									</td>
								</tr>
								<tr><td height="25"></td></tr>
								<tr>
        							<td align="center" mc:edit="banner-header" style="color: #596064; font-size: 22px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;" class="main-header">
			        					<multiline>
			        						YOUR TITLE / HEADLINE INTRODUCTION HERE
			        					</multiline>
			        				</td>	
        						</tr>
        						<tr><td height="20"></td></tr>
        						<tr>
        							<td align="center" mc:edit="banner-subheader" style="color: #8c8c8C; font-size: 15px; font-family: 'PT Sans', Arial, sans-serif; line-height: 36px;" class="main-subheader">
        								<multiline>
        									Lorem ipsum dolor sit amet, consectetur <a href="" style="color: #0a8ccd; text-decoration: none;">adipiscing elit.</a> Sed in 
        								</multiline>
        							</td>
        						</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="35"></td></tr>
				</table>
			</td>
		</tr>
		<!-------------- end banner ------------->
		</layout>
		
		<!-------------- section ------------->
		<layout label="1/3 image 2/3 text">
		<tr>
			<td align="center">
				<table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="ffffff" class="container600">
					<tr>
						<td>
							<table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="container560">
								<tr>
				    				<td>	
				    					<table border="0" width="200" align="left" cellpadding="0" cellspacing="0" class="section-item">
											<tr>
												<td>
													<a href="" style=" border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="image3" src="http://promailthemes.com/mailto/layout1/white/blue2/img/image1.png" style="display: block; width: 200px; height: 193px;" width="200" height="193" border="0" alt="section image" class="section-img"/></a>
												</td>
											</tr>
										</table>
										
										<table border="0" width="40" align="left" cellpadding="0" cellspacing="0">
											<tr><td width="40" height="30"></td></tr>
										</table>
										
										<table border="0" width="320" align="left" cellpadding="0" cellspacing="0" class="section-item">
											
											<tr>
												<td mc:edit="title3" style="color: #4e4e4e; font-size: 16px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;" class="main-header">
						        					<multiline>
						        						YOUR TITLE / HEADLINE INTRODUCTION HERE
						        					</multiline>
						        				</td>	
											</tr>
											
											<tr><td height="12"></td></tr>
											
											<tr>
												<td mc:edit="text3" style="color: #8c8c8c; font-size: 15px; font-family: 'PT Sans', Arial, sans-serif; line-height: 36px;">
													<multiline>
														Lorem ipsum dolor sit amet consectetur  sed in bibendum nunc sit amet euismod dolo bibendum nunc sit amet euismod dolo.
													</multiline>
												</td>
											</tr>
											
											<tr><td height="14"></td></tr>
											
											<tr>
												<td>
													<a href="" style="display: block; width: 118px;  border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="readMoreBtn" width="118" height="35" border="0" style="display: block; width: 118px; height: 35px;" src="http://promailthemes.com/mailto/layout1/white/blue2/img/readmore-btn.png" alt="read more" /></a>
												</td>
											</tr>	
										</table>
										
				    				</td>
				    			</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
				    				
		<!-------------- end section ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="ffffff" border="0" class="container600">
					<tr><td bgcolor="ffffff" height="45"></td></tr>
				</table>
			</td>
		</tr>
		</layout>
		</repeater>
		<!-------------- footer ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" bgcolor="0a8ccd" border="0" class="container600">
					<tr><td height="45"></td></tr>
					<tr>
						<td>
							<table width="560" align="center" cellpadding="0" cellspacing="0" border="0" class="container560">
								
								<tr>
				    				<td>	
				    					<table width="120" align="left" cellpadding="0" cellspacing="0" border="0" class="footer-item">
					    					<tr>
					    						<td align="center" mc:edit="footer-title1" style="color: #ffffff; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								SERVICES
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="25"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-subtitle1" style="color: #efefef; font-size: 14px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">Web Design</a>
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="15"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-subtitle1" style="color: #efefef; font-size: 13px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">Logo Design</a>
					    							</singleline>
					    						</td>
					    					</tr>
				    					</table>
				    					
				    					<table border="0" width="20" align="left" cellpadding="0" cellspacing="0" class="hide-iphone">
											<tr><td width="20" height="30"></td></tr>
										</table>
										
				    					<table width="120" align="left" cellpadding="0" cellspacing="0" border="0" class="footer-item">
					    					<tr>
					    						<td align="center" mc:edit="footer-title2" style="color: #ffffff; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								DOWNLOADS
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="25"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-subtitle2" style="color: #efefef; font-size: 14px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">Pro Freebies</a>
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="15"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-subtitle3" style="color: #efefef; font-size: 13px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">Buttons Pack</a>
					    							</singleline>
					    						</td>
					    					</tr>
				    					</table>
				    					
				    					<table border="0" width="20" align="left" cellpadding="0" cellspacing="0" class="vertical-spacing">
											<tr><td width="20" height="30"></td></tr>
										</table>
										
				    					<table width="120" align="left" cellpadding="0" cellspacing="0" border="0" class="footer-item">
					    					<tr>
					    						<td align="center" mc:edit="footer-title3" style="color: #ffffff; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								RESOURCES
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="25"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-title3" style="color: #efefef; font-size: 14px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">Web Elements</a>
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="15"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-subtitle5" style="color: #efefef; font-size: 13px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">Best Pack</a>
					    							</singleline>
					    						</td>
					    					</tr>
				    					</table>
				    					
				    					<table border="0" width="20" align="left" cellpadding="0" cellspacing="0" class="hide-iphone">
											<tr><td width="20" height="30"></td></tr>
										</table>
										
				    					<table width="140" align="left" cellpadding="0" cellspacing="0" border="0" class="footer-item">
					    					<tr>
					    						<td align="center" style="color: #ffffff; font-size: 14px; font-weight: bold; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="display: block; width: 119px;  border-style: none !important; border: 0 !important;"><img editable="true" mc:edit="logo2" width="119" height="17" border="0" style="display: block; width: 119px; height: 17px;" src="http://promailthemes.com/mailto/layout1/white/blue2/img/footer-logo.png" alt="mailto logo" /></a>
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="25"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-title6" style="color: #efefef; font-size: 14px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef; text-decoration: none;">880 - 543 - 8790</a>
					    							</singleline>
					    						</td>
					    					</tr>
					    					<tr><td height="15"></td></tr>
					    					<tr>
					    						<td align="center" mc:edit="footer-title7" style="color: #efefef; font-size: 13px; font-family: 'PT Sans', Arial, sans-serif;">
					    							<singleline>
					    								<a href="" style="color: #efefef !important; text-decoration: none !important;;">www.mailto.com</a>
					    							</singleline>
					    						</td>
					    					</tr>
				    					</table>
				    								
				    				</td>
								</tr>
							</table>				   
						</td>
					</tr> 		
					<tr><td height="40"></td></tr>		
				</table>
			</td>
		</tr>
		<!-------------- end footer ------------->
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" border="0" class="container600">
					<tr>
						<td>
							<img editable="false" src="http://promailthemes.com/mailto/layout1/white/blue2/img/bottom-bg.png" style="display: block; width: 600px; height: 6px;" width="600" height="6" border="0" class="divider" />
						</td>
					</tr>
					
				</table>
			</td>
		</tr>
		
		<tr><td height="40"></td></tr>		
		
		<tr>
			<td>
				<table width="600" cellpadding="0" align="center" cellspacing="0" border="0" class="container600">
					<tr>
						<td align="center" mc:edit="unsubscribe" style="color: #acacac; font-size: 14px; font-family: 'PT Sans', Arial, sans-serif;" class="unsubscribe">
	    					<multiline>
	    						If you are no longer interested in receiving this email Unsubscribe 
	    					</multiline>
	    					<unsubscribe style="color: #0a8ccd; text-decoration: none;">Here</unsubscribe>
	    				</td>	
					</tr>
					<tr><td height="30"></td></tr>		
					<tr>
						<td align="center" mc:edit="copy" style="color: #8c8c8c; font-size: 15px; font-family: 'PT Sans', Arial, sans-serif;" class="unsubscribe">
	    					<multiline>
	    						Copyright © Mailto Company  2012-2013.
	    					</multiline>
	    				</td>	
					</tr>
					<tr><td height="45"></td></tr>		
				</table>
			</td>
		</tr>
		
		
	</table>
</body>
</html>
