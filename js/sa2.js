var setAssociative = 2;


//Set Associative Configuration
var rendertableText = ["",""];
var phpNaming = ["","Two"];
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;

//Drawing
var tagpathstopX =[0 ,0];
 

function loadConfiguration()
{
	loadCommonConfiguration();

	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory) && checkPowerOfTwo(offset)) == false) { alert ("El tamaño de caché, tamaño de memoria y la compensación deben estar en potencia de dos");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);
		tagBit = memoryBit - cacheBit - offsetBit;
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)) && (tagBit>=1))
		{		
			for (ca=0;ca<cache;ca++)
			{
				LRU[ca]= new Array();
				LRU[ca] = initialiseNumberedArray(setAssociative);
				validBitArray[ca] = initialiseZeroArray(setAssociative);
				validTagArray[ca] = initialiseHypenArray(setAssociative);
				validDataArray[ca] = initialiseZeroArray(setAssociative);
				validDirtyBitArray[ca]=	initialiseZeroArray(setAssociative);
			}

			offsetrange = offset - 1;
			drawingSpaceHeight = (cache)*25 +700;
			
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
            document.getElementById('submitConfig').disabled = true;
            document.getElementById("information_text").innerHTML=printConfigurationSA2();
		}
		else{
			alert("La configuración no es válida. Inténtalo de nuevo. \n El tamaño de la memoria debe ser mayor que el total de caché y el tamaño de desplazamiento. El tamaño del caché debe ser mayor o igual a 2 ^ (2 * "+offsetBit+").")
		}
	}
	
}





function instructionLoadExecuteSteps()
{	

	getDrawingProperties();
			
	if (document.getElementById("instruction_data").disabled==false)
	{
		alert("Por favor envíe la instrucción de carga");
		document.getElementById('instruction_data').focus();	
	}
	else{
	if (step==0){
		step0();
	}
	else if (step==1){	
		replace_old_cache= false;
        step1();
	}
		
	else if (step==2){
		evaluateValidBit(setAssociative);
	}	
	else if (step==3){
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="El siguiente es el diagrama de análisis.";
		document.getElementById("information_text").style.backgroundColor="";	
		
		var tagpathheight = drawingSpaceHeight - 250;
		var validtagV = drawingSpaceHeight - 200;
		var dataXYArr=[0,0];
		var andWidth = 70;
		//COLOUR THE TAG FOR BOTH TABLE
		for (comp=0; comp<setAssociative;comp++)
		{
            //TAG
            highlight("tag","green");
            var validXY = document.getElementById(("valid"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 30;
            var path2 = "M "+validXY+","+v2+" V "+validtagV;
            arrowcache += "<path d='"+path2+"' stroke='green' stroke-width='1.25' fill='none'/>";
			
			//DATA VERTICAL LINE
			var dataXY = document.getElementById(("tag"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left;
			if (dataXY >= (validXY+50)){dataXY = validXY+50;}
			var pathDataVerticalLine = "M "+dataXY+","+v2+" V "+validtagV;
			arrowcache += "<path d='"+pathDataVerticalLine+"' stroke='#4682b4' stroke-width='1.25' fill='none'/>";			
			dataXYArr[comp]= dataXY;
			//AND IMAGE
			arrowcache += "<image xlink:href='img/and.png'  x="+(validXY-10)+" y="+(validtagV-20)+" height="+andWidth+" width="+andWidth+" ></image>";		
			tagpathstopX[comp]= (validXY+dataXY)/2;
		}

			

			//INSTRUCTION BREAKDOWN TAG
			var tagBitX = (document.getElementById("tagbit").getBoundingClientRect().right +document.getElementById("tagbit").getBoundingClientRect().left  )/2 - boxXY.left;
			var tagpath = "M "+ tagBitX+","+topBoundAddressEvaluated+" V "+ v2 + "V "+tagpathheight+" H "+dataXYArr[0];
			arrowcache += "<path d='"+tagpath+"' stroke='black' stroke-width='1.25' fill='none'/>";
			
			
			//TAG HORIZONTAL LINE TO BRANCH
			var path4 = "M "+tagBitX+","+(tagpathheight - 40)+" H "+ 0.60*document.getElementById("tableSpace").offsetWidth + " V "+tagpathheight +" H "+(dataXYArr[1]) ;
			arrowcache += "<path d='"+path4+"' stroke='black' stroke-width='1.25' fill='none'/>";	
			
			//DRAW LINE FROM BOTH AND GATE
			var Xmid = 0.48*document.getElementById("tableSpace").offsetWidth;	

			var lineforBothGateY1 = tagpathheight+ andWidth + 50; //drawingSpaceHeight - 130
			var lineforBothGateY2 = drawingSpaceHeight - 110 ;		
			var pathforBothGate = "M "+ tagpathstopX[0] +","+ (tagpathheight+ andWidth +15) + "V " + lineforBothGateY1 + " H "+ (Xmid-35) +
								  "V "+ lineforBothGateY2 +" H" + (Xmid+35) + "V " + lineforBothGateY1+
								  "H "+ tagpathstopX[1] + "V "+ (tagpathheight+ andWidth + 15) ;
			arrowcache += "<path d='"+pathforBothGate+"' stroke='black' stroke-width='1.25' fill='none'/>";	
			
			//OR IMAGE
				arrowcache += "<image xlink:href='img/or.png'  x="+(Xmid-40)+" y="+(lineforBothGateY2-10)+
								" height="+ 45+" width="+ 80 +" ></image>";	


											
								
			document.getElementById("drawingSpace").innerHTML = arrowcache;
	}
	else if (step==4)
	{		
		if (cacheReplacementPolicy == "Random")	{LRUIndex = LRU[validindex][Math.floor(Math.random() * LRU[validindex].length)]; }	
		if (validBitArray[validindex].indexOf(1)==-1)
		{
			document.getElementById("information_text").innerHTML ="Ambos bits válidos son 0, por lo tanto, la compuerta AND es Fallo";
			document.getElementById("information_text").style.backgroundColor="#F09999";
				
			var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				if (cacheReplacementPolicy != "Random")
				{
					LRUIndex = LRU[validindex].shift();
					LRU[validindex].push(LRUIndex);
				}
					validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" P. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
				

		}
		else{
			document.getElementById("information_text").innerHTML="El bit válido es 1, por lo tanto, debemos buscar en la tabla de ambos caché. ";
			
			var compareY = drawingSpaceHeight - 275;
			if (validBitArray[validindex][0] == 1)
			{
			//COMPARE IMAGE
			var compareX =  tagpathstopX[0] + 20  - 25;
			arrowcache += "<image xlink:href='img/compare.png'  x="+compareX+" y="+compareY+
							" height=50 width=50 ></image>";
			}
			if (validBitArray[validindex][1]==1)
			{
			//COMPARE IMAGE TABLE 2
			var compareX =  tagpathstopX[1] + 20 - 25;
			arrowcache += "<image xlink:href='img/compare.png'  x="+compareX+" y="+compareY+
							" height=50 width=50 ></image>";
							
			}				
		
			if (validTagArray[validindex][0]==document.getElementById("tag").value)
			{

				document.getElementById("information_text").innerHTML+="La etiqueta solicitada y la etiqueta en caché para la primera tabla son las mismas.";
				document.getElementById("information_text").style.backgroundColor="#55F055";				

				var zeroarrowcache = arrowcache.replace ("img/and.png","img/and_hit.png");
				var newarrowcache = zeroarrowcache.replace ("img/and.png","img/and_miss.png");			
				hitBoolean = true;
				hit++;

				

								var indexOfTag = validTagArray[validindex].indexOf((document.getElementById("tag").value));
								var index = LRU[validindex].indexOf(indexOfTag);
								LRUIndex = indexOfTag;
						if (cacheReplacementPolicy =="LRU")
							{
								if (index>-1)
								{
									LRU[validindex].splice(index, 1);
								}
								LRU[validindex].push(LRUIndex);
							}

			
			}
			else if (validTagArray[validindex][1]==document.getElementById("tag").value)
			{
				document.getElementById("information_text").innerHTML+="La etiqueta solicitada y la etiqueta en caché para la segunda tabla son las mismas.";
				document.getElementById("information_text").style.backgroundColor="#FFcc55";				

				var zeroarrowcache = arrowcache.replace ("img/and.png","img/and_miss.png");
				var newarrowcache = zeroarrowcache.replace ("img/and.png","img/and_hit.png");
				hitBoolean = true;
				hit++;	
				
				

								var indexOfTag = validTagArray[validindex].indexOf((document.getElementById("tag").value));
								var index = LRU[validindex].indexOf(indexOfTag);
								LRUIndex = indexOfTag;
						if (cacheReplacementPolicy =="LRU")
							{
								if (index>-1)
								{
									LRU[validindex].splice(index, 1);
								}
								LRU[validindex].push(LRUIndex);
							}

			}			
			else{
				document.getElementById("information_text").innerHTML+="La etiqueta solicitada y la etiqueta en caché NO son las mismas.";		
				var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				if (cacheReplacementPolicy != "Random")
				{
					LRUIndex = LRU[validindex].shift();
					LRU[validindex].push(LRUIndex);
				}
				if (validBitArray[validindex][LRUIndex]==1){replace_old_cache = true;}
				validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "Bloque "+block+" Palabra 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
			}
					

			
		}

		document.getElementById("drawingSpace").innerHTML = newarrowcache;	
		
	}	

	else if (step==5){
					document.getElementById("information_text").innerHTML ="La Compuerta OR se actualiza desde el resultado de los bloques de caché. <br>";	
		    newarrowcache = document.getElementById("drawingSpace").innerHTML;	
			
				if (!hitBoolean){
					var finalarrowcache = newarrowcache.replace("img/or.png","img/or_miss.png");
					document.getElementById("information_text").innerHTML +="Ambas compuertas AND son MISS, por lo tanto, FALLO DE CACHE";
				}
				else{
					var finalarrowcache = newarrowcache.replace("img/or.png","img/or_hit.png");
					document.getElementById("information_text").innerHTML +="Una de las compuertas AND es HIT, por lo tanto, ACIERTO DE CACHE";					

				}
		
		document.getElementById("drawingSpace").innerHTML = finalarrowcache;	
		if (replace_old_cache == true){step = 100;}
		
	}
		else if (step==101){

		if (validDirtyBitArray[validindex][LRUIndex]==1){
				document.getElementById("information_text").innerHTML ="La memoria caché reemplaza el índice anterior. Como el bit de modificación es 1, la memoria se actualizará.";
				var old_binary = validTagArray[validindex][LRUIndex]+""+document.getElementById("index").value;
				var old_block = parseInt(old_binary,2);		
				document.getElementById(("memoryRow"+old_block)).style.backgroundColor="#4682b4";
				document.getElementById(("memoryRow"+old_block)).scrollIntoView(true);
				validDirtyBitArray[validindex][LRUIndex]=0;
				document.getElementById("drawingSpace").innerHTML = "";
				resetColouring();
				document.getElementById(("tag"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#4682b4";
				document.getElementById(("valid"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#4682b4";				
				document.getElementById(("tr"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#4682b4";
				
		}
		
		else{
			document.getElementById("information_text").innerHTML="La memoria caché reemplaza el bloque anterior. Como el bit de modificación es 0, no se requiere ninguna operación adicional.";	
		}
		step=5;
	}
	else if (step==6){
		if (hitBoolean){
			document.getElementById("information_text").innerHTML = "Los datos se obtienen de la memoria caché. ";	
		}
		else{
		document.getElementById("information_text").innerHTML = "La tabla de caché se actualiza en consecuencia. <br>"+ 
																"Bloque "+ block.toUpperCase() +" con Tamaño de bloque "+
																"0" + offsetrange + "  se copia en la caché";
									
		}


		document.getElementById("drawingSpace").innerHTML = "";
		loadTableSetAssociative();

		document.getElementById("index").style.backgroundColor ="";
		document.getElementById("tag").style.backgroundColor ="#4682b4";
		document.getElementById("information_text").style.backgroundColor="#4682b4";		

	

		//Highlight Updated Row
		var findtherow = "tr"+phpNaming[LRUIndex]+validindex;
		document.getElementById(findtherow).style.backgroundColor ="#4682b4";	
		
		if (!hitBoolean)
		{
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="#4682b4";	
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true);			
		}

	}
	
	else{
		document.getElementById("information_text").innerHTML ="El ciclo ha sido completado.<br> Por favor envíe otras instrucciones";
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="";	
		window.scroll(0,0);
		
		var findtherow = "tr"+phpNaming[LRUIndex]+validindex;
		document.getElementById(findtherow).style.backgroundColor ="";	
		  if (hitBoolean==true)
                {
                    listOfInstructionsTF.push(1);
                }
            else{
                listOfInstructionsTF.push(0);
            }
		
		
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;	
		step+=-1;
		endOfInstruction();
        pushNoToLoad();
	}

	step++;

	}
}
function storeInstruction(){
	if (document.getElementById("instruction_data").disabled==false)
	{
		document.getElementById('instruction_data').focus();	
		alert("Por favor envíe la instrucción de la tienda");
	}
	else{
	getDrawingProperties();
	//Check write policy
	var writeThroughBack = $("input[name=WriteThroughBack]:checked").val();
	var validindex =  parseInt(document.getElementById("index").value,2) ;
	if (step_store==0){
		//Show instruction breakdown
		step0();
		store_cache_found = false;
		whichTableContainsValidTag = 0;
	}
	else if (step_store==1){


		if (writeThroughBack=="Write Through"){
			document.getElementById("information_text").innerHTML ="Se adopta la política de Escritura Inmediata. La memoria principal y la caché se actualizarán al mismo tiempo.";
		}
		else{
			document.getElementById("information_text").innerHTML ="Se adopta la política de Post-escritura. La caché se actualizará con bit de modificación.";
		}
	}
	else if (step_store==2){
		step1();
		document.getElementById("information_text").innerHTML ="La búsqueda se realiza para determinar si la dirección solicitada está disponible en la tabla de caché.";


		
	}
	else if (step_store==3){
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("index").style.backgroundColor="";		
		if ((validTagArray[validindex][0]==document.getElementById("tag").value) || (validTagArray[validindex][1]==document.getElementById("tag").value))
		{
			document.getElementById("information_text").innerHTML ="La dirección solicitada se encuentra en la tabla de caché.";
			store_cache_found = true;
			hit++;
			if (validTagArray[validindex][1]==document.getElementById("tag").value){
				whichTableContainsValidTag = 1;
				document.getElementById(("tr"+phpNaming[0]+validindex)).style.backgroundColor="";
			}
			else{
				document.getElementById(("tr"+phpNaming[1]+validindex)).style.backgroundColor="";
			}
		}
		else{

			document.getElementById("information_text").innerHTML ="La dirección solicitada NO se encuentra en la tabla de caché.";
			document.getElementById("information_text").style.backgroundColor="#ffcccc";
			for (var i= 0 ; i<setAssociative; i++){
				document.getElementById(("tr"+phpNaming[i]+validindex)).style.backgroundColor="";
			}
		}
	}
	else if (step_store==4){
		document.getElementById("information_text").style.backgroundColor="#ffe745";
		if (store_cache_found){
			if (writeThroughBack=="Write Through"){

					document.getElementById("information_text").innerHTML ="El bloque de memoria resaltado y la caché se actualizan";

					document.getElementById(("tr"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor ="#4682b4";	
					listOfInstructionsTF.push(1);
				}
			else{ // Write Back with Cache Hit
				document.getElementById("information_text").innerHTML ="El caché resaltada se actualiza con bit de modificación = 1";
				validDirtyBitArray[validindex][whichTableContainsValidTag]=1;
                listOfInstructionsTF.push(1);
				loadTableSetAssociative();
				resetColouring();
				document.getElementById(("tr"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor="#4682b4";
				document.getElementById(("dirtybit"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor="#ffe745";
				document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";
			}
		}

		else{
			listOfInstructionsTF.push(0);
			var	writePolicy = $("input[name=WriteAllocateAround]:checked").val();
			if (writePolicy=="Write Allocate"){
				if (cacheReplacementPolicy != "Random")
				{
					LRUIndex = LRU[validindex].shift();
					LRU[validindex].push(LRUIndex);
				}
				document.getElementById("information_text").innerHTML ="La memoria caché no contiene la etiqueta solicitada. Los datos se cargan y el contenido se actualiza según la política de Escritura con Ubicación.";
				validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" P. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
				loadTableSetAssociative();
				document.getElementById(("tr"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#4682b4";
			}
			else{
				document.getElementById("information_text").innerHTML ="La memoria caché no contiene la etiqueta solicitada. El bloque de memoria se actualiza según la política de Escritura sin Ubicación.";					

			}

			//Show affected memory block
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="#4682b4";
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true)
				


		}
	}
		
	else {
			for (var i= 0 ; i<setAssociative; i++){
				document.getElementById(("tr"+phpNaming[i]+validindex)).style.backgroundColor="";
			}
		
		document.getElementById(("dirtybit"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor="";
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		endOfInstruction();
		step_store=-1;
		//Clear affected memory block highlight
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";
		pushNoToLoad();
		updateHitMissLabel();
	}
	step_store++
	}
}

