var sessionstart = false;
var validBitArray = new Array();
var validTagArray = new Array();
var validDataArray = new Array();
var validDirtyBitArray = new Array();
var drawingSpaceHeight = 0;
var cache = 0;
var memory = 0;
var offset = 0;
var offsetrange=0;
var tag = 0;
var block = 0;
var arrowcache,v2;
var hit=0;
var hit_store=0;
var step=0;
var step_store = 0;
var replace_old_cache= false;
var store_cache_found = false;
var listOfInstructions = new Array();
var listOfInstructionsTF = new Array();
var listOfInstructionsLS = new Array();
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;
var instructionType = 0;

function loadConfiguration()
{
	offsetBit = parseInt(document.getElementById('offsetsize').value);
    offset = Math.pow(2,offsetBit);    
	cache = parseInt(document.getElementById('cachesize').value)/ offset;
	memory = parseInt(document.getElementById('memorysize').value);

	
	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory)) == false) { alert ("Caché, Memoria y palabra deben estar en potencia de dos");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);

        //Condition for Valid Cache Configuration
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)))
		{
            tagBit = memoryBit - cacheBit - offsetBit;
			validBitArray = initialiseZeroArray(cache);
			validTagArray = initialiseHypenArray(cache);
			validDataArray = initialiseZeroArray(cache);
			validDirtyBitArray = initialiseZeroArray(cache);
			offsetrange = offset - 1;
			drawingSpaceHeight = cache*25 +500;
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
			document.getElementById('submitConfig').disabled = true;
            document.getElementById("information_text").innerHTML=printConfiguration();
		}
		else{
			alert("La configuración no es válida. Vuelva a intentarlo. \n El tamaño de la memoria debe ser mayor que el tamaño total de la memoria caché y el tamaño de desplazamiento")
		}
	}
}


function setfirsttable(){
	
	setFirstTableGeneric(tagBit, offsetBit);
	document.getElementById("tableSpace").innerHTML = loadTable();
	sessionstart=true;
	document.getElementById("indexbit").innerHTML= cacheBit + " bit";
	resetColouring();
}


function instructionLoadExecuteSteps()
{	

	var validIndex =  parseInt(document.getElementById("index").value,2) ;
	window.scroll(0,0);
	var boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
	var validXY = document.getElementById(("valid"+validIndex)).getBoundingClientRect().right - boxXY.left - 30;
	var boundAddressEvaluated =  document.getElementById("addressevaluated").getBoundingClientRect();
	var topBoundAddressEvaluated = boundAddressEvaluated.top;
	var	topBoundCacheTable = document.getElementById("container").getBoundingClientRect().top - boxXY.top;
	
	if (document.getElementById("instruction_data").disabled==false)
	{
		document.getElementById('instruction_data').focus();	
		alert("Por favor envíe la instrucción de carga");
	}
	else{
	if (step==0){
		replace_old_cache= false;
		step0();

		
	}
	else if (step==1){	
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="El bloque solicitado se buscará en la memoria caché como se resalta en amarillo";
		document.getElementById("tag").style.backgroundColor ="";
		document.getElementById("index").style.backgroundColor="Yellow";
		document.getElementById("offset").style.backgroundColor="";
		document.getElementById("information_text").style.backgroundColor="Yellow";
		
		   
		var findtherow = "tr"+validIndex ;
		leftCacheRow = document.getElementById(findtherow).getBoundingClientRect().left - boxXY.left;
		v2 = document.getElementById(findtherow).getBoundingClientRect().top - boxXY.top+10;	
		var indexXY = document.getElementById("index").getBoundingClientRect();
		var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;

		var path = "M "+indexMid+","+topBoundAddressEvaluated+" V "+ topBoundCacheTable +" H 10 V "+ v2 + "H "+leftCacheRow;
		arrowcache = "<svg width = 100% height=100%><path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";

		document.getElementById(findtherow).style.backgroundColor ="yellow";	
	

	}
		
	else if (step==2){
		evaluateValidBit(1);

	}	
	else if (step==3){
		document.getElementById("information_text").innerHTML ="A continuación se muestra el diagrama de análisis.";
		document.getElementById("information_text").style.backgroundColor="";
		document.getElementById(("tag"+validIndex)).style.backgroundColor ="blue";	
		window.scroll(0,(drawingSpaceHeight-200));
		var tagpathheight = drawingSpaceHeight - 150;
		var validtagV = drawingSpaceHeight - 100;
		var andWidth = 70;
			//TAG VERTICAL LINE

			var path2 = "M "+validXY+","+v2+" V "+(drawingSpaceHeight-100);
			arrowcache += "<path d='"+path2+"' stroke='green' stroke-width='1.25' fill='none'/>";

			
			//DATA VERTICAL LINE
			var path3 = "M "+(validXY+50)+","+v2+" V "+(drawingSpaceHeight-100);
			arrowcache += "<path d='"+path3+"' stroke='blue' stroke-width='1.25' fill='none'/>";
			
			//INSTRUCTION BREAKDOWN TAG
			var boundTagBit =  document.getElementById("tagbit").getBoundingClientRect();
			var tagpath = "M "+(boundTagBit.left - boxXY.left)+","+ topBoundAddressEvaluated +" H 5 V "+tagpathheight+" H "+(validXY+50);
			arrowcache += "<path d='"+tagpath+"' stroke='black' stroke-width='1.25' fill='none'/>";
			
			//AND IMAGE
			arrowcache += "<image xlink:href='img/and.png'  x="+(validXY-10)+" y="+(validtagV-20)+" height="+andWidth+" width="+andWidth+" ></image>";	
					
			
			
			document.getElementById("drawingSpace").innerHTML = arrowcache;
	}
	else if (step==4)
	{	

		if (validBitArray[validIndex]==0)
		{
			document.getElementById("information_text").innerHTML ="El bit válido es 0, por lo tanto, se obtiene FALLO DE CACHÉ. La memoria caché se actualiza con el nuevo conjunto de datos.";
            listOfInstructionsTF.push(0); document.getElementById("information_text").style.backgroundColor="#F09999";
			var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
			document.getElementById("drawingSpace").innerHTML = newarrowcache;
			
		
		}
		else{
			document.getElementById("information_text").innerHTML="El bit válido es 1, por lo tanto, debemos buscar en la etiqueta. ";

			//COMPARE IMAGE
			var compareY = drawingSpaceHeight - 175;
			arrowcache += "<image xlink:href='img/compare.png'  x="+(validXY+25)+" y="+compareY+
							" height=50 width=50 ></image>";
			document.getElementById("drawingSpace").innerHTML = arrowcache;
			if (validTagArray[validIndex]==document.getElementById("tag").value)
			{
				document.getElementById("information_text").innerHTML+="La etiqueta solicitada y la etiqueta en caché son las mismas. Por lo tanto, ACIERTO DE CACHÉ";
				document.getElementById("information_text").style.backgroundColor="#55F055";				

				var newarrowcache = arrowcache.replace ("img/and.png","img/and_hit.png");
				document.getElementById("drawingSpace").innerHTML = newarrowcache;
				hit++;
                listOfInstructionsTF.push(1);
			}
			else{
				document.getElementById("information_text").innerHTML+="La etiqueta solicitada y la etiqueta en caché NO son lo mismo. Por lo tanto, FALLO DE CACHÉ";	             document.getElementById("information_text").style.backgroundColor="#FFcc55";				
				var newarrowcache = arrowcache.replace ("img/and.png","img/and_miss.png");
				document.getElementById("drawingSpace").innerHTML = newarrowcache;	
				listOfInstructionsTF.push(0);
				step = 100; //special flow because we need to write back to memory block
				}
		}
		
		
	}	
	else if (step==101){

		if (validDirtyBitArray[validIndex]==1){
				document.getElementById("information_text").innerHTML ="La memoria caché reemplaza el bloque anterior. Como el bit sucio es 1, la memoria se actualizará.";
				var old_binary = validTagArray[validIndex]+""+document.getElementById("index").value;
				var old_block = parseInt(old_binary,2);		
				document.getElementById(("memoryRow"+old_block)).style.backgroundColor="#2222FF";
				document.getElementById(("memoryRow"+old_block)).scrollIntoView(true);
				validDirtyBitArray[validIndex]=0;
				document.getElementById("drawingSpace").innerHTML = "";
				resetColouring();
				document.getElementById(("tag"+validIndex)).style.backgroundColor="#2222FF";
				document.getElementById(("valid"+validIndex)).style.backgroundColor="#2222FF";				
				document.getElementById(("tr"+validIndex)).style.backgroundColor="#2222FF";
				
		}
		
		else{
			document.getElementById("information_text").innerHTML="La memoria caché reemplaza el índice anterior. Como el bit sucio es 0, no se requiere operación adicional.";	
		}
		step=4;
	}
	else if (step==5){
		window.scroll(0,0);

		document.getElementById("information_text").innerHTML = "La tabla de caché se actualiza en consecuencia. <br>"+ 
																"Bloque "+ block.toUpperCase() +" con desplazamiento "+
																"0 a " + offsetrange + "se transfiere al caché";
		document.getElementById("information_text").style.backgroundColor="#2222FF";
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="#2222FF";
		document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true);
		validBitArray[validIndex]=1;
		validTagArray[validIndex]=document.getElementById("tag").value ;
		validDataArray[validIndex]= ("Bloque "+block+" Palabra 0 - "+ offsetrange).toUpperCase();
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("tableSpace").innerHTML = loadTable();
		resetColouring();
		document.getElementById("index").style.backgroundColor ="";
		document.getElementById("tag").style.backgroundColor ="blue";
		document.getElementById(("tr"+validIndex)).style.backgroundColor ="blue";	


	}
	
	else{
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="El ciclo se ha completado. <br> Por favor envíe otras instrucciones";
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";
		var findtherow = "tr"+validIndex ;
		document.getElementById(findtherow).style.backgroundColor ="";	
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;
		endOfInstruction();
		step=-1;
        pushNoToLoad();
	}

	step++;

	}
}

function LRUController(){}
function storeInstruction(){
	if (document.getElementById("instruction_data").disabled==false)
	{
		document.getElementById('instruction_data').focus();	
		alert("Por favor envíe la intrucción de almacenamiento");
	}
	else{
	//Check write policy
	var writeThroughBack = $("input[name=WriteThroughBack]:checked").val();
	var validIndex =  parseInt(document.getElementById("index").value,2) ;
	if (step_store==0){
		//Show instruction breakdown
		step0();
		store_cache_found = false;
	}
	else if (step_store==1){


		if (writeThroughBack=="Write Through"){
			document.getElementById("information_text").innerHTML ="Se aprueba la política de escritura directa. La memoria y la caché se actualizarán al mismo tiempo.";
		}
		else{
			document.getElementById("information_text").innerHTML ="Se adopta la política de reescritura. La caché se actualizará con bit sucio.";
		}
	}
	else if (step_store==2){
		
			document.getElementById("information_text").innerHTML ="La búsqueda se realiza para determinar si la dirección solicitada está disponible en la tabla de caché.";


			window.scroll(0,0);
			var boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
			var validXY = document.getElementById(("valid"+validIndex)).getBoundingClientRect().right - boxXY.left - 30;
			var boundAddressEvaluated =  document.getElementById("addressevaluated").getBoundingClientRect();
			var topBoundAddressEvaluated = boundAddressEvaluated.top;
			var	topBoundCacheTable = document.getElementById("container").getBoundingClientRect().top - boxXY.top;
	
			//Find the valid index in cache table
			window.scroll(0,0);
			document.getElementById("tag").style.backgroundColor ="";
			document.getElementById("index").style.backgroundColor="Yellow";
			document.getElementById("offset").style.backgroundColor="";
			document.getElementById("information_text").style.backgroundColor="Yellow";
			
			   
			var findtherow = "tr"+validIndex ;
			leftCacheRow = document.getElementById(findtherow).getBoundingClientRect().left - boxXY.left;
			v2 = document.getElementById(findtherow).getBoundingClientRect().top - boxXY.top+10;	
			var indexXY = document.getElementById("index").getBoundingClientRect();
			var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;

			var path = "M "+indexMid+","+topBoundAddressEvaluated+" V "+ topBoundCacheTable +" H 10 V "+ v2 + "H "+leftCacheRow;
			arrowcache = "<svg width = 100% height=100%><path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";
			document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";

			document.getElementById(findtherow).style.backgroundColor ="yellow";	
			
		

		
	}
	else if (step_store==3){
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("index").style.backgroundColor="";		
		if (validTagArray[validIndex]==document.getElementById("tag").value){
			document.getElementById("information_text").innerHTML ="La dirección solicitada se encuentra en la tabla de caché.";
			store_cache_found = true;
			hit++;
		}
		else{

			document.getElementById("information_text").innerHTML ="La dirección solicitada NO se encuentra en la tabla de caché.";
			document.getElementById("information_text").style.backgroundColor="#ffcccc";
			document.getElementById(("tr"+validIndex)).style.backgroundColor="";
		}
	}
	else if (step_store==4){
		document.getElementById("information_text").style.backgroundColor="yellow";
		if (store_cache_found){	
			if (writeThroughBack=="Write Through"){
					document.getElementById("information_text").innerHTML ="El bloque de memoria resaltado y el caché se actualizan";
					document.getElementById(("tr"+validIndex)).style.backgroundColor ="#2222FF";	
					listOfInstructionsTF.push(1);
				}
			else {
				document.getElementById("information_text").innerHTML ="El caché resaltado se actualiza con bit sucio = 1";
				validDirtyBitArray[validIndex]=1;
                listOfInstructionsTF.push(1);
				document.getElementById("tableSpace").innerHTML = loadTable();
				resetColouring();
				document.getElementById(("tr"+validIndex)).style.backgroundColor="blue";
				document.getElementById(("dirtybit"+validIndex)).style.backgroundColor="yellow";
			}	
		}
		else{
			listOfInstructionsTF.push(0);
			var	writePolicy = $("input[name=WriteAllocateAround]:checked").val();
			if (writePolicy=="Write Allocate"){
				document.getElementById("information_text").innerHTML ="La memoria caché no contiene la etiqueta solicitada. Los datos se cargan y el contenido se actualiza en función de la Política de asignación al escribir.";
				validBitArray[validIndex]=1;
				validTagArray[validIndex]=document.getElementById("tag").value ;
				validDataArray[validIndex]= ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();
				document.getElementById("drawingSpace").innerHTML = "";
				document.getElementById("tableSpace").innerHTML = loadTable();
				resetColouring();
				document.getElementById("index").style.backgroundColor ="";
				document.getElementById("tag").style.backgroundColor ="blue";
				document.getElementById(("tr"+validIndex)).style.backgroundColor ="blue";	
			
			}
			else{
				document.getElementById("information_text").innerHTML ="La memoria caché no contiene la etiqueta solicitada. Solo el bloque de memoria se actualiza según la Política de escritura.";					

			}
			//Show affected memory block
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="#2222FF";
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true)
				
			
			

		}
	}
		
	else {
		document.getElementById(("tr"+validIndex)).style.backgroundColor="";

		document.getElementById(("dirtybit"+validIndex)).style.backgroundColor="";
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		endOfInstruction();
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;
		step_store=-1;
		pushNoToLoad();
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";
	}
	step_store++
	}
}