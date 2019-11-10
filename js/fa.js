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
var step = 0;
var step_store = 0;
var replace_old_cache= false;
var store_cache_found = false;
var arrowcache,v2;
var hit=0;
var listOfInstructions = new Array();
var listOfInstructionsTF = new Array();
var listOfInstructionsLS = new Array();
var indexforcache=0;
var cacheBit = 0, memoryBit = 0, offsetBit = 0, tagBit = 0;
var LRU = new Array();
var LRUIndex=0;
var cacheReplacementPolicy ="FIFO";

function loadConfiguration()
{
	offsetBit = parseInt(document.getElementById('offsetsize').value);
    offset = Math.pow(2,offsetBit);    
	cache = parseInt(document.getElementById('cachesize').value)/ offset;
		memory = parseInt(document.getElementById('memorysize').value);

	if ((checkPowerOfTwo(cache) && checkPowerOfTwo(memory)) == false) { alert ("Cache, Memory and Offset must be in power of two");}
	else
	{
		cacheBit = logtwo(cache);
		memoryBit = logtwo(memory);
		if ((cacheBit>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit)))
		{
			validBitArray = initialiseZeroArray(cache);
			validTagArray = initialiseHypenArray(cache);
			validDataArray = initialiseZeroArray(cache);
			LRU = initialiseNumberedArray(cache);
			validDirtyBitArray = initialiseZeroArray(cache);
			LRUController();
			offsetrange = offset - 1;
			drawingSpaceHeight = cache*25 +400;
			document.getElementById("drawingSpace").style.height= drawingSpaceHeight+'px';
			setmemorytable();
			setfirsttable();
			document.getElementById('submitConfig').disabled = true;
            document.getElementById("information_text").innerHTML=" Offset = " + offsetBit+ " bits"+
                "<br> Instruction Length = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Block = "+memoryBit +" bits - " +offsetBit+" bits = "+ (memoryBit-offsetBit)+ " bits"+
                "<br><br> Please submit Instruction.";
		}
		else
		{
			alert("Configuration is not valid. Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size");
		}
	}
	
}
function setfirsttable(){
	sessionstart=true;
	document.getElementById("tableSpace").innerHTML = loadTable();
	tagBit = memoryBit - offsetBit;
	setFirstTableGeneric(tagBit, offsetBit);
	resetColouring();

}

function instructionLoadExecuteSteps()
{	
	var indexOfTag = validTagArray.indexOf((document.getElementById("tag").value));

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
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Index requested will be searched in whole cache";
		document.getElementById("tag").style.backgroundColor ="yellow";
		document.getElementById("offset").style.backgroundColor="";
		document.getElementById("information_text").style.backgroundColor="Yellow";
		var indexXY = document.getElementById("tag").getBoundingClientRect();
		var boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
		var topBoundAddressEvaluated = document.getElementById("addressevaluated").getBoundingClientRect().top;
		var topBoundCacheTable = document.getElementById("container").getBoundingClientRect().top-boxXY.top;
		var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;
		arrowcache = "<svg width = 100% height=100%>";
		
		for (x = 1; x <= cache; x++) { 
		    var targettedTR = document.getElementById(("tr"+(x-1))).getBoundingClientRect();
			var path = "M "+indexMid+","+topBoundAddressEvaluated +"V "+topBoundCacheTable+" H 10 V "+ (targettedTR.top-50-5) + " H "+(targettedTR.left - boxXY.left);
			arrowcache += "<path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";		
		}
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
	}
		
	else if (step==2){

		if (indexOfTag== -1)
		{
	
			document.getElementById("information_text").innerHTML ="No cache contains "+document.getElementById("tag").value+" as value, therefore cache MISS is obtained.";
			document.getElementById("information_text").style.backgroundColor="#F09999";
			if (validBitArray[indexOfTag]==1){ step=100;}
			if (cacheReplacementPolicy!="Random")
			{
				LRUIndex = LRU.shift();
				LRU.push(LRUIndex);
			}
            listOfInstructionsTF.push(0);

			
		}
		else
		{
			document.getElementById("information_text").innerHTML ="Valid tag is found in the cache.";		
			document.getElementById(("tr"+indexOfTag)).style.backgroundColor ="green";	
			document.getElementById("information_text").style.backgroundColor="green";
			
			if (cacheReplacementPolicy =="LRU")
			{
				var index = LRU.indexOf(indexOfTag);
				LRUIndex = indexOfTag;

				if (index>-1)
				{
					LRU.splice(index, 1);
				}
				LRU.push(indexOfTag);
			}

			
			hit++;
            listOfInstructionsTF.push(1);
		}	
		if (cacheReplacementPolicy == "Random")
		{
			LRUIndex = LRU[Math.floor(Math.random() * LRU.length)];
		}


	}	
	else if (step==101){

		if (validDirtyBitArray[LRUIndex]==1){
				document.getElementById("information_text").innerHTML ="Cache replace the old index. Since dirty bit is 1, Memory will be updated.";
				var old_binary = validTagArray[LRUIndex]+""+document.getElementById("index").value;
				var old_block = parseInt(old_binary,2);		
				document.getElementById(("memoryRow"+old_block)).style.backgroundColor="#2222FF";
				document.getElementById(("memoryRow"+old_block)).scrollIntoView(true);
				validDirtyBitArray[LRUIndex]=0;
				document.getElementById("drawingSpace").innerHTML = "";
				resetColouring();
				document.getElementById(("tag"+LRUIndex)).style.backgroundColor="#2222FF";
				document.getElementById(("valid"+LRUIndex)).style.backgroundColor="#2222FF";				
				document.getElementById(("tr"+LRUIndex)).style.backgroundColor="#2222FF";
				
		}
		
		else{
			document.getElementById("information_text").innerHTML="Cache replace the old index. Since dirty bit is 0, there is no additional operation required.";	
		}
		step=2;
	}
	else if (step==3){
		if (indexOfTag== -1)
		{
			document.getElementById("information_text").innerHTML ="The new cache data is imported to cache.";
			document.getElementById("information_text").style.backgroundColor="#FFcc55";			
			validBitArray[LRUIndex]=1;
			validTagArray[LRUIndex]=document.getElementById("tag").value ;
			var stringDataArray = "Block "+block+" Word 0 - "+ offsetrange ;
			validDataArray[LRUIndex]= stringDataArray.toUpperCase();

			document.getElementById("tableSpace").innerHTML = loadTable();

			resetColouring();
			document.getElementById(("tr"+LRUIndex)).style.backgroundColor ="blue";
			
		}
		else{
			document.getElementById("information_text").innerHTML ="Data is loaded from cache with index "+ indexOfTag;
			document.getElementById("information_text").style.backgroundColor="#55F055";
		}
		document.getElementById("drawingSpace").innerHTML = "";
		document.getElementById("tag").style.backgroundColor ="blue";
		var blockDec = parseInt(block,16);
		document.getElementById(("memoryRow"+blockDec)).style.backgroundColor="blue";
		document.getElementById(("memoryRow"+blockDec)).scrollIntoView(true);
		
	
	}
	else{
		window.scroll(0,0);
		var blockDec = parseInt(block,16);
		document.getElementById(("memoryRow"+blockDec)).style.backgroundColor="";
		document.getElementById(("tr"+LRUIndex)).style.backgroundColor ="";	
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" ;

		step=-1;
		LRUController();
		endOfInstruction();
        pushNoToLoad();
	}

	step++;

	}
}
function LRUController(){
		if (cacheReplacementPolicy !="Random")
		{
			document.getElementById('nextReplace').innerHTML=  LRU[0];
			document.getElementById('lastReplace').innerHTML=  LRU[(LRU.length-1)];
		}
		else
		{
			document.getElementById('nextReplace').innerHTML=  " - ";
			document.getElementById('lastReplace').innerHTML=  " - ";			
		}

}
function storeInstruction(){
	if (document.getElementById("instruction_data").disabled==false)
	{
		document.getElementById('instruction_data').focus();	
		alert("Please submit the Store Instruction");
	}
	else{
	//Check write policy
	var writeThroughBack = $("input[name=WriteThroughBack]:checked").val();
	var indexOfTag = validTagArray.indexOf((document.getElementById("tag").value));
	if (step_store==0){
		//Show instruction breakdown
		step0();
		store_cache_found = false;
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
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="Search is performed to determine whether the requested address is available in cache table.";
		document.getElementById("tag").style.backgroundColor ="yellow";
		document.getElementById("offset").style.backgroundColor="";
		document.getElementById("information_text").style.backgroundColor="Yellow";
		var indexXY = document.getElementById("tag").getBoundingClientRect();
		var boxXY = document.getElementById("drawingSpace").getBoundingClientRect();
		var topBoundAddressEvaluated = document.getElementById("addressevaluated").getBoundingClientRect().top;
		var topBoundCacheTable = document.getElementById("container").getBoundingClientRect().top-boxXY.top;
		var indexMid = (indexXY.right + indexXY.left)/2 - boxXY.left;
		arrowcache = "<svg width = 100% height=100%>";
		
		for (x = 1; x <= cache; x++) { 
		    var targettedTR = document.getElementById(("tr"+(x-1))).getBoundingClientRect();
			var path = "M "+indexMid+","+topBoundAddressEvaluated +"V "+topBoundCacheTable+" H 10 V "+ (targettedTR.top-50-5) + " H "+(targettedTR.left - boxXY.left);
			arrowcache += "<path d='"+path+"' stroke='red' stroke-width='1.25' fill='none'/>";		
		}
		document.getElementById("drawingSpace").innerHTML = arrowcache+"</svg>";
			
		

		
	}
	else if (step_store==3){
		document.getElementById("drawingSpace").innerHTML = "";	
		if (indexOfTag!= -1){
			document.getElementById("information_text").innerHTML ="Requested address is found in cache table.";
			document.getElementById(("tr"+indexOfTag)).style.backgroundColor ="green";	
			store_cache_found = true;
			hit++;
		}
		else{

			document.getElementById("information_text").innerHTML ="Requested address is NOT found in cache table.";
			document.getElementById("information_text").style.backgroundColor="#ffcccc";
		}
	}
	else if (step_store==4){
		document.getElementById("information_text").style.backgroundColor="yellow";
		if (store_cache_found){
			if (writeThroughBack=="Write Through"){
					document.getElementById("information_text").innerHTML ="Highlighted memory block and cache is updated";
					document.getElementById(("tr"+indexOfTag)).style.backgroundColor ="#2222FF";	
					listOfInstructionsTF.push(1);
				}
			else{
				document.getElementById("information_text").innerHTML ="Highlighted cache is updated with dirty bit = 1";
				validDirtyBitArray[indexOfTag]=1;
                listOfInstructionsTF.push(1);
				document.getElementById("tableSpace").innerHTML = loadTable();
				resetColouring();
				document.getElementById(("tr"+indexOfTag)).style.backgroundColor="blue";
				document.getElementById(("dirtybit"+indexOfTag)).style.backgroundColor="yellow";
			}
			
		}
		else{
			listOfInstructionsTF.push(0);
			var	writePolicy = $("input[name=WriteAllocateAround]:checked").val();
			if (writePolicy=="Write Allocate"){
				if (cacheReplacementPolicy!="Random")
				{
					LRUIndex = LRU.shift();
					LRU.push(LRUIndex);
				}
				document.getElementById("information_text").innerHTML ="Cache does not contain requested tag. Data is loaded and content is updated based on Write On Allocate Policy.";
				validBitArray[LRUIndex]=1;
				validTagArray[LRUIndex]=document.getElementById("tag").value ;
				var stringDataArray = "Block "+block+" Word 0 - "+ offsetrange ;
				validDataArray[LRUIndex]= stringDataArray.toUpperCase();

				document.getElementById("tableSpace").innerHTML = loadTable();

				resetColouring();
				document.getElementById(("tr"+LRUIndex)).style.backgroundColor ="blue";

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
		if (indexOfTag!=-1){
			document.getElementById(("tr"+indexOfTag)).style.backgroundColor="";
			document.getElementById(("dirtybit"+indexOfTag)).style.backgroundColor="";
		}
		
		document.getElementById('listOfInstructionsLabel').innerHTML = printListOfPrevInsLS(listOfInstructions, listOfInstructionsTF, listOfInstructionsLS);
		endOfInstruction();
		step_store=-1;
		pushNoToLoad();
		var hitRate = hit / listOfInstructions.length;
		document.getElementById('hitRateLabel').innerHTML=  Math.round(hitRate*100,2) +"%";
		document.getElementById('missRateLabel').innerHTML= Math.round((1 - hitRate)*100,2) + "%" 
		document.getElementById(("memoryRow"+parseInt(block,16))).style.backgroundColor="";
	}
	step_store++
	}
}