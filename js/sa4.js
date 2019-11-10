

var setAssociative = 4;



//Set Associative Configuration
var rendertableText = ["","","",""];
var phpNaming = ["","Two","Three","Four"];
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;

var tagpathstopX =[0 ,0, 0, 0];
	
function loadConfiguration()
{
	loadCommonConfiguration();

	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory)) == false) { alert ("Cache, Memory and Offset must be in power of two");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);
		tagBit = memoryBit - cacheBit - offsetBit;
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)) && (tagBit>=2))
		{		

			for (ca=0;ca<cache;ca++)
			{
				LRU[ca]= new Array();
				LRU[ca] = initialiseNumberedArray(setAssociative);
				validBitArray[ca] = initialiseZeroArray(setAssociative);
				validTagArray[ca] = initialiseHypenArray(setAssociative);
				validDataArray[ca] = initialiseZeroArray(setAssociative);
				validDirtyBitArray[ca] = initialiseZeroArray(setAssociative);
			}

			offsetrange = offset - 1;
			drawingSpaceHeight = (cache)*25 +700;
            setConst();
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
            document.getElementById('submitConfig').disabled = true;	
            document.getElementById("information_text").innerHTML=printConfigurationSA4();
		}
		else{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size. Cache size must be bigger or equals to 2^(4*OffsetBits).")
		}
	}
	
}

function instructionLoadExecuteSteps()
{	

	var validindex = parseInt(document.getElementById("index").value,2) ;
	getDrawingProperties();
	var tagpathstopX1 = document.getElementById(("valid"+phpNaming[0]+validindex)).getBoundingClientRect().right - boxXY.left;
	var tagpathstopX4 = document.getElementById(("valid"+phpNaming[3]+validindex)).getBoundingClientRect().right - boxXY.left;		
	
	if (document.getElementById("instruction_data").disabled==false)
	{
		alert("Please submit the Load Instruction");
		document.getElementById('instruction_data').focus();	
	}
	else{
		
	if (step==0){
		replace_old_cache= false;
		step0();
	}
	else if (step==1){	
		step1();
	}
		
	else if (step==2){
		evaluateValidBit(setAssociative);
	}	
	else if (step==3){
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Following is the analysis diagram.";
		document.getElementById("information_text").style.backgroundColor="";	
		var andWidth = 70;	
		var lineforBothGateXmid = 0.5*document.getElementById("tableSpace").offsetWidth;	
			for (comp=0;comp<setAssociative; comp++)
			{
				//TAG
				var findthetag = "tag"+phpNaming[comp]+validindex ;
				document.getElementById(findthetag).style.backgroundColor ="green";
				var validXY = document.getElementById(("valid"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 30;
				var path2 = "M "+validXY+","+v2+" V "+min200;
				arrowcache += "<path d='"+path2+"' stroke='green' stroke-width='1.25' fill='none'/>";		
			
				
				//DATA VERTICAL LINE
				var dataXY = document.getElementById(("tag"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 30;
				if (dataXY >= (validXY+50)){dataXY = validXY+50;}
				var pathDataVerticalLine = "M "+dataXY+","+v2+" V "+min200;
				arrowcache += "<path d='"+pathDataVerticalLine+"' stroke='blue' stroke-width='1.25' fill='none'/>";
                tagpathstopX[comp] = dataXY;
                
                
				//COMPARE WITH REQUESTED TAG LINE
				var compareLineXY = dataXY -25;
				var pathDataVerticalLine = "M "+compareLineXY+","+min290+" V "+ min250 + "H "+dataXY;
				arrowcache += "<path d='"+pathDataVerticalLine+"' stroke='black' stroke-width='1.25' fill='none'/>";	

				//LINE AFTER AND OPERATION IS DONE
				var pathAndLine = "M "+(validXY+25)+","+(drawingSpaceHeight-180)+" V "+ (drawingSpaceHeight-120);
				arrowcache += "<path d='"+pathAndLine+"' stroke='red' stroke-width='1.25' fill='none'/>";
			
				//AND IMAGE
				arrowcache += "<image xlink:href='img/and.png'  x="+(validXY-10)+" y="+(min200-20)+" height="+andWidth+" width="+andWidth+" ></image>";		
				
				//LINE to OR GATES
				var line1 = "M "+ (lineforBothGateXmid-20 + comp*13) +" , " +  (drawingSpaceHeight-120) + " V " + (drawingSpaceHeight-85);
				arrowcache += "<path d='"+line1+"' stroke='red' stroke-width='1.25' fill='none'/>";	
            }
        
            //TAG HORIZONTAL LINE FROM INSTRUCTION BREAK DOWN TO min290

			var pathHorizontalLineFromInstructionBreakDown = "M 60,"+topBoundAddressEvaluated+" V "+(topBoundCacheTable-3)+" H 0 V "+ min290 +" H "+dataXY ;
            arrowcache += "<path d='"+pathHorizontalLineFromInstructionBreakDown+"' stroke='black' stroke-width='1.25' fill='none'/>";	

			
			//DRAW LINE FROM  AND GATES
			var pathforBothGate = "M "+ (tagpathstopX1-5) +","+(drawingSpaceHeight-120)+
								  "H "+ (tagpathstopX4-5);
			arrowcache += "<path d='"+pathforBothGate+"' stroke='red' stroke-width='1.25' fill='none'/>";	
			
			
			//OR IMAGE
            arrowcache += "<image xlink:href='img/or.png'  x="+(lineforBothGateXmid-40)+" y="+min90+" height=40 width=80 ></image>";	
								
			document.getElementById("drawingSpace").innerHTML = arrowcache;
	}
	else if (step==4)
	{		
        window.scroll(0,0);
		if (cacheReplacementPolicy == "Random")	{LRUIndex = LRU[validindex][Math.floor(Math.random() * LRU[validindex].length)]; }	
		if (validBitArray[validindex].indexOf(1)==-1)
		{
			document.getElementById("information_text").innerHTML ="All valid bit is 0. Therefore, all of AND gate is MISS";
			document.getElementById("information_text").style.backgroundColor="#F09999";
					
			var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				if (cacheReplacementPolicy != "Random")
				{
					LRUIndex = LRU[validindex].shift();
					LRU[validindex].push(LRUIndex);
				}
					validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" W. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();

		}
		else{

			document.getElementById("information_text").innerHTML="Valid bit is 1, therefore we should look into all cache table. ";
			for (comp=0;comp<setAssociative; comp++)
			{
				if (validBitArray[validindex][comp]==1)
				{
					//COMPARE IMAGE
					var compareX = document.getElementById(("tag"+phpNaming[comp]+validindex)).getBoundingClientRect().right - boxXY.left - 45;
					arrowcache += "<image xlink:href='img/compare.png'  x="+(tagpathstopX[comp]-20)+" y="+min270+
								" height=40 width=40 ></image>";
				}
			}			
		
			if ((validTagArray[validindex].indexOf(document.getElementById("tag").value)!=-1) )
			{

				document.getElementById("information_text").style.backgroundColor="#55F055";				


				hit++;
				hitBoolean = true;
				if(cacheReplacementPolicy=="LRU")
				{
						var indexOfTag = validTagArray[validindex].indexOf((document.getElementById("tag").value));
						var index = LRU[validindex].indexOf(indexOfTag);
						LRUIndex = indexOfTag;

							if (index>-1)
								{
									LRU[validindex].splice(index, 1);
								}
								LRU[validindex].push(LRUIndex);
								
				}
							if (validTagArray[validindex][0]==document.getElementById("tag").value)
							{
                                indexHighlight = 0;
								var newarrowcache = arrowcache.replace ("and.png","and_hit.png");
								var newarrowcache = newarrowcache.replace (/and.png/g,"and_miss.png");			
							
							}
							else if (validTagArray[validindex][1]==document.getElementById("tag").value)
							{
                                indexHighlight = 1;
								var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
								var newarrowcache2 = newarrowcache.replace ("and.png","and_hit.png");
								var newarrowcache= newarrowcache2.replace(/and.png/g,"and_miss.png");
							}
							else if (validTagArray[validindex][2]==document.getElementById("tag").value){
                                indexHighlight = 2;
								var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace ("and.png","and_hit.png");	
								var newarrowcache= newarrowcache.replace("and.png","and_miss.png");
							}
							else if (validTagArray[validindex][3]==document.getElementById("tag").value)
							{
                                indexHighlight = 3;
								var newarrowcache = arrowcache.replace ("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace("and.png","and_miss.png");
								newarrowcache = newarrowcache.replace("and.png","and_miss.png");
								var newarrowcache= newarrowcache.replace ("and.png","and_hit.png");
							}
							document.getElementById("information_text").innerHTML+="Requested Tag and cached tag for table"+ (indexHighlight+1) +" is the same.";

			}
			else{
				document.getElementById("information_text").innerHTML+="Requested Tag and cached tag is NOT the same. Therefore, CACHE MISS";		
				document.getElementById("information_text").style.backgroundColor="#FFcc55";				
				var newarrowcache = arrowcache.replace (/and.png/g,"and_miss.png");
				if (cacheReplacementPolicy != "Random")
				{
					LRUIndex = LRU[validindex].shift();
					LRU[validindex].push(LRUIndex);
				}
				if (validBitArray[validindex][LRUIndex]==1){replace_old_cache = true;}				
				validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" W. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
			}
					

			
		}

		document.getElementById("drawingSpace").innerHTML = newarrowcache;	
		
	}	
	else if (step==5){
			document.getElementById("information_text").innerHTML="OR gate is updated from cache blocks result.";	
		    newarrowcache = document.getElementById("drawingSpace").innerHTML;	
			
				if (!hitBoolean){
					var finalarrowcache = newarrowcache.replace("or.png","or_miss.png");
					document.getElementById("information_text").innerHTML +="All of the AND gate is MISS, therefore CACHE MISS";
					if (replace_old_cache == true){step = 100;}
				}
				else{
					var finalarrowcache = newarrowcache.replace("or.png","or_hit.png");
					document.getElementById("information_text").innerHTML +="One of the AND gate is MISS, therefore CACHE MISS";

				}
		
		document.getElementById("drawingSpace").innerHTML = finalarrowcache;	
		
	}
	else if (step==101){

		if (validDirtyBitArray[validindex][LRUIndex]==1){
				document.getElementById("information_text").innerHTML ="Cache replace the old index. Since dirty bit is 1, Memory will be updated.";
				if (document.getElementById("indexbit").innerHTML!=0){
					var old_binary = validTagArray[validindex][LRUIndex]+""+document.getElementById("index").value;
				}
				else
				{
					var old_binary = validTagArray[validindex][LRUIndex]+"";	
				}
				var old_block = parseInt(old_binary,2);		
				document.getElementById(("memoryRow"+old_block)).style.backgroundColor="#2222FF";
				document.getElementById(("memoryRow"+old_block)).scrollIntoView(true);
				validDirtyBitArray[validindex][LRUIndex]=0;

				resetColouring();
				document.getElementById(("tag"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#2222FF";
				document.getElementById(("valid"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#2222FF";				
				document.getElementById(("tr"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#2222FF";
				
		}
		
		else{
			document.getElementById("information_text").innerHTML="Cache replace the old index. Since dirty bit is 0, there is no additional operation required.";	
		}
		document.getElementById("drawingSpace").innerHTML = "";
		if (!hitBoolean)
		{
	
            indexHighlight = LRUIndex;	
		}	
		
		//Clear tag and valid bit background color
		for (var i= 0 ; i<setAssociative; i++){
			document.getElementById(("tag"+phpNaming[i]+validindex)).style.backgroundColor="";
			document.getElementById(("valid"+phpNaming[i]+validindex)).style.backgroundColor="";
		}
		//Highlight Updated Row
		var findtherow = "tr"+phpNaming[indexHighlight]+validindex;
		document.getElementById(findtherow).style.backgroundColor ="blue";	
		document.getElementById("information_text").style.backgroundColor="blue";	
		document.getElementById(("dirtybit"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="#yellow";
		step=5;
	}
	else if (step==6){

		if (hitBoolean){
			document.getElementById("information_text").innerHTML = "Data is fetched from cache. ";	
		}
		else{
		document.getElementById("information_text").innerHTML = "Cache table is updated accordingly. <br>"+ 
																"Block "+ block.toUpperCase() +" with offset "+
																"0 to " + offsetrange + "  is copied into the cache";
									
		}



		loadTableSetAssociative();

		document.getElementById("index").style.backgroundColor ="";
		document.getElementById("tag").style.backgroundColor ="blue";

	

		if (!hitBoolean)
		{
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="#FF4444";	
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true);		

		}	
        



	}
	
	else{
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor ="";	
		window.scroll(0,0);
		
		var findtherow = "tr"+phpNaming[indexHighlight]+validindex;
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
        pushNoToLoad();
		endOfInstruction();
		step+=-1;
	}

	step++;

	}
}
function storeInstruction(){
	if (document.getElementById("instruction_data").disabled==false)
	{
		document.getElementById('instruction_data').focus();	
		alert("Please submit the Store Instruction");
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
			document.getElementById("information_text").innerHTML ="Write Through Policy is adopted. Memory and Cache will be updated at the same time.";
		}
		else{
			document.getElementById("information_text").innerHTML ="Write Back Policy is adopted. Cache will be updated with dirty bit.";
		}
	}
	else if (step_store==2){
		step1();
		document.getElementById("information_text").innerHTML ="Search is performed to determine whether the requested address is available in cache table.";


		
	}
	else if (step_store==3){
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("index").style.backgroundColor="";		
		whichTableContainsValidTag = validTagArray[validindex].indexOf(document.getElementById("tag").value);
		if (whichTableContainsValidTag!=-1)
		{
			document.getElementById("information_text").innerHTML ="Requested address is found in cache table.";
			store_cache_found = true;
			hit++;

			for (var i= 0 ; i<setAssociative; i++){
				if (i!= whichTableContainsValidTag){
					document.getElementById(("tr"+phpNaming[i]+validindex)).style.backgroundColor="";
				}
			}
		}
		else{

			document.getElementById("information_text").innerHTML ="Requested address is NOT found in cache table.";
			document.getElementById("information_text").style.backgroundColor="#ffcccc";
			for (var i= 0 ; i<setAssociative; i++){
				document.getElementById(("tr"+phpNaming[i]+validindex)).style.backgroundColor="";
			}
		}
	}
	else if (step_store==4){
		document.getElementById("information_text").style.backgroundColor="yellow";
		if (store_cache_found){
			if (writeThroughBack=="Write Through"){

					document.getElementById("information_text").innerHTML ="Highlighted memory block and cache is updated";

					document.getElementById(("tr"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor ="#2222FF";	
					listOfInstructionsTF.push(1);
				}
			else{ // Write Back with Cache Hit
				document.getElementById("information_text").innerHTML ="Highlighted cache is updated with dirty bit = 1";
				validDirtyBitArray[validindex][whichTableContainsValidTag]=1;
                listOfInstructionsTF.push(1);
				loadTableSetAssociative();
				resetColouring();
				document.getElementById(("tr"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor="blue";
				document.getElementById(("dirtybit"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor="yellow";
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
				document.getElementById("information_text").innerHTML ="Cache does not contain requested tag. Data is loaded and content is updated based on Write On Allocate Policy.";
				validBitArray[validindex][LRUIndex]=1;
				validTagArray[validindex][LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "B. "+block+" W. 0 - "+ offsetrange ;
				validDataArray[validindex][LRUIndex]= stringDataArray.toUpperCase();
				loadTableSetAssociative();
				document.getElementById(("tr"+phpNaming[LRUIndex]+validindex)).style.backgroundColor="blue";
			}
			else{
				document.getElementById("information_text").innerHTML ="Cache does not contain requested tag. Only memory block is updated based on Write Around Policy.";					

			}

			//Show affected memory block
			document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="#2222FF";
			document.getElementById(("memoryRow"+parseInt(block,16))).scrollIntoView(true)
				


		}
	}
		
	else {
			for (var i= 0 ; i<setAssociative; i++){
				document.getElementById(("tr"+phpNaming[i]+validindex)).style.backgroundColor="";
			}
		if (whichTableContainsValidTag!=-1){
		document.getElementById(("dirtybit"+phpNaming[whichTableContainsValidTag]+validindex)).style.backgroundColor="";
		}
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		endOfInstruction();
		step_store=-1;
		//Clear affected memory block highlight
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";
		updateHitMissLabel();
		pushNoToLoad();
	}
	step_store++
	}
}