var sessionstart = false;
var validBitArray = [];
var validTagArray = [];
var validDataArray = [];
var validDirtyBitArray = [];
var LRUIndex = [];
var setAssociative=[];
var drawingSpaceHeight = 0;
var cache = [];
var cacheType = [];
var memory = 0;
var offset = 0;
var offsetrange=0;
var tag = 0;
var block = 0;
var hit = [];
var miss = [];
var writeThroughBack = "";
var writeAllocateAround = "";
//Cache Replacement Policy
var cacheReplacementPolicy;
var LRU = [];


var instructionsData = [];
var instructionsType=[];
var instructionsLine=[];
var listOfInstructions = [];
var listOfInstructionsTF =[];
var listOfInstructionsLW=[];
var cacheBit = [], memoryBit = 0, offsetBit = 0, tagBit = [];
var counter=[];
var drawTableClass = ["","","sa2table","","sa4table"];
var chartcounter = 1;
var resourceNAND = [];
var chartBody =[];
    chartBody[0]=[];
    chartBody[0]=['ID', 'Add. Resource Needed', 'Hit Rate', 'Cache Type','Cache Size'];
function graph(){
    if (document.getElementById("curve_chart").style.visibility=='visible' )
        {
        document.getElementById("curve_chart").style.visibility='hidden';     
        }
    else{
        document.getElementById("curve_chart").style.visibility='visible'; 
    }
    loadGraph();
}
$.getScript("https://www.gstatic.com/charts/loader.js", function(){ google.charts.load('current', {'packages':['corechart']});})
function loadGraph(){
    google.charts.setOnLoadCallback(drawSeriesChart);
    function drawSeriesChart() {
          var data = google.visualization.arrayToDataTable(chartBody);
          var options = {
            title: 'Correlation between hit rate, add. resource needed (NAND gates), cache type ' +
                   'and cache size',
            hAxis: {title: 'Add. Resource Needed (NAND Gates)'},
            vAxis: {title: 'Hit Rate'},
            bubble: {textStyle: {fontSize: 11}}
          };
          var chart = new google.visualization.BubbleChart(document.getElementById('curve_chart'));
          chart.draw(data, options);
        }
    }
function Initialise()
{
    listOfInstructions=[];
	listOfInstructionsTF =[];
	resourceNAND = [];
	hit =[];
	miss =[];
    document.getElementById("listOfInstructionsLabel").innerHTML = listOfInstructions.toString();
    for (var cacheLoop=1; cacheLoop<=4;cacheLoop++)
        {
            hit[cacheLoop]=0;
            miss[cacheLoop]=0;
            counter[cacheLoop]=0;
            LRUIndex[cacheLoop]=0;
            resourceNAND[cacheLoop]=0;
            listOfInstructionsTF[cacheLoop]=[];
        }
}
function loadConfiguration()
{

	var allValid = true;
    offsetBit = parseInt(document.getElementById('offsetsize').value);
    offset = Math.pow(2,offsetBit);
	memory = parseInt(document.getElementById('memorysize').value);
    Initialise();
    for (var cacheLoop = 1; cacheLoop<=4; cacheLoop++)
        {
            LRU[cacheLoop]=[];
            var cacheName = "cache" + cacheLoop + "_size";
            var e = document.getElementById(("cache"+cacheLoop+"type"));
            cacheType[cacheLoop] = e.options[e.selectedIndex].text;
                         if ((cacheType[cacheLoop]=="Direct Mapped Cache")||
                            (cacheType[cacheLoop]=="Fully Associative Cache"))
                            {
                                setAssociative[cacheLoop] = 1;
                            }
            else if (cacheType[cacheLoop]=="2-Way Set Associative Cache")
                { setAssociative[cacheLoop] = 2;}
            else {setAssociative[cacheLoop] = 4;}
            //ONLY AFTER KNOW THE SET ASSOCIATIVE WE COULD DETERMINE THE INDEX
            cache[cacheLoop] = parseInt(document.getElementById(("cache" + cacheLoop + "_size")).value) / offset / setAssociative[cacheLoop];

            if (setAssociative[cacheLoop]>1)
                {
                    for (var i=0; i<cache[cacheLoop];i++)
                        LRU[cacheLoop][i]=initialiseNumberedArray(setAssociative[cacheLoop]);
                
                    LRUIndex[cacheLoop]=[];
                  for (var i=0; i<cache[cacheLoop]; i++)
                      {
                          LRUIndex[cacheLoop][i]=0;
                          
                      }
                }
            else{
                LRU[cacheLoop][0]=initialiseNumberedArray(cache[cacheLoop]);
            }

            
            if ((checkPowerOfTwo(cache[cacheLoop]) && checkPowerOfTwo(memory)) == false) 
                { allValid=false;
                  alert ("Cache, Memory and Offset must be in power of two");
                }
            else{
                cacheBit[cacheLoop] = logtwo(cache[cacheLoop]);
                memoryBit = logtwo(memory);
                offsetrange = offset - 1;
                if ((cacheBit[cacheLoop]>=0) && (memoryBit>=0) && (offsetBit>=0) && (memoryBit>(offsetBit+cacheBit[cacheLoop])))
                    {    
                        validBitArray[cacheLoop]=[];
                        validTagArray[cacheLoop]=[];
                        validDataArray[cacheLoop]=[];
						validDirtyBitArray[cacheLoop] =[];
                        for (var ca=0; ca<setAssociative[cacheLoop]; ca++)
                            {
                            validBitArray[cacheLoop][ca] = initialiseZeroArray(cache[cacheLoop]);
                            validTagArray[cacheLoop][ca] = initialiseHypenArray(cache[cacheLoop]);
                            validDataArray[cacheLoop][ca] = initialiseZeroArray(cache[cacheLoop]);
							validDirtyBitArray[cacheLoop][ca] = initialiseZeroArray(cache[cacheLoop]);
                            }
                    }
                else{
                    allValid = false;
                    alert(("Configuration is not valid for Cache "+ cacheLoop +" Please try again. \n Memory Size must be bigger than the total of Cache and Offset Size"));
                }
            }
        }
    if (allValid==true)
    {
        document.getElementById('submitConfig').disabled = true;
		document.getElementById('rndButton').disabled = true;
        setTable();
    }
        
}


function setTable(){
	sessionstart=true;
    var whattowrite="";
    for (cacheLoop=1;cacheLoop<=4;cacheLoop++)
        {

        whattowrite+="<div class=\"col-sm-12 col-md-12 head3\">"+
						"<div id=head3 class=\"col-sm-12 col-md-12\">"+
							"<div class=\"col-sm-6 col-md-6\"><h4>"+ cacheLoop +". "+ cacheType[cacheLoop]+"["+ cache[cacheLoop]+"] </h4></div>"+
							"<div  class=\"col-sm-6 col-md-6\"> HIT <label id=hitrate"+cacheLoop+" class=hitrate> - </label> MISS <label id=missrate"+cacheLoop+" class=missrate> - </label>"+
								" || ADD. RESOURCES <label id=resource"+cacheLoop+" class= resource> 0 </label> NAND</div>";

        whattowrite += setInstructionTable(cacheLoop);
        tagBit[cacheLoop] = memoryBit - cacheBit[cacheLoop] - offsetBit;
		whattowrite+="<br><div class=\"col-sm-12 col-md-12\"> <div class=\"col-sm-12 col-md-12\">Cache Table</div> ";
        for (var ca=0; ca<setAssociative[cacheLoop];ca++)
        {
			var col_size = 12 / setAssociative [cacheLoop];
			var style="col-sm-"+col_size+" col-md-"+col_size;
            whattowrite+="<div id=\"draw\" class="+style+" "+drawTableClass[setAssociative[cacheLoop]]+">";
            whattowrite+="<table class=drawtable id=cache"+cacheLoop+"table"+ca+">"+
                "<tr><td  id=marker-1> Index</td><td> Valid </td><td> Tag </td> <td> Data (Hex) </td><td>Dirty Bit </td></tr>";
            for (var z = 0; z<cache[cacheLoop]; z++) { 
            whattowrite += "<tr id=tr"+cacheLoop+"_"+ca+"_"+z+"><td id=marker"+z+">"+z+"</td><td id=valid"+cacheLoop+"_"+ca+"_"+z+"> "+validBitArray[cacheLoop][ca][z]+
                            " </td><td id=tag"+cacheLoop+"_"+ca+"_"+z+">"+ validTagArray[cacheLoop][ca][z] +
                            "</td><td id=offset"+cacheLoop+"_"+ca+"_"+z+">"+ validDataArray[cacheLoop][ca][z]+"</td>"+
							"<td id=dirtybit"+cacheLoop+"_"+ca+"_"+z+">"+ validDirtyBitArray[cacheLoop][ca][z]+"</td></tr>";
            }
            whattowrite +="</table></div>";
        
        }
		whattowrite+="</div></div></div>";
        }
    document.getElementById("tableSpace").innerHTML = whattowrite;
    for (var cacheLoop=1; cacheLoop<=4; cacheLoop++)
    {
        tagBit[cacheLoop] = memoryBit - cacheBit[cacheLoop] - offsetBit;
        if (cacheType[cacheLoop]=="Fully Associative Cache"){
        document.getElementById(("tagbit"+cacheLoop)).innerHTML= (tagBit[cacheLoop]+cacheBit[cacheLoop]) + " bit";



        }
        else{
             document.getElementById(("tagbit"+cacheLoop)).innerHTML= tagBit[cacheLoop] + " bit";
            document.getElementById(("indexbit"+cacheLoop)).innerHTML= cacheBit[cacheLoop] + " bit"; 
        }
        document.getElementById(("offsetbit"+cacheLoop)).innerHTML= offsetBit + " bit";	
        document.getElementById(("cache"+cacheLoop+"_size")).disabled = true;
        document.getElementById(("cache"+cacheLoop+"type")).disabled = true;
        document.getElementById('memorysize').disabled = true;
        document.getElementById('offsetsize').disabled = true;
        resetColouring();
    }
}
function setInstructionTable(loop)
{
    var strtowrite ="<div class=\"col-sm-12 col-md-12 instructionBreakdown\">"+
						"<div class=\"col-sm-12 col-md-12\">Instruction Breakdown </div>"+
						"<div id=\"analysisinstruction\" class=\"analysisinstruction\"> <table  id=caption class=caption>";
    if (cacheType[loop]=="Fully Associative Cache")
        {
        strtowrite+="<tr><td><input type=\"text\" id=\"tagIB"+loop+"\" placeholder=\"tag\" disabled></input></td><td><input type=\"text\" id=\"offsetIB"+loop+"\" placeholder=\"offset\" disabled></input></td></tr><tr><td id=\"tagbit"+loop+"\">  &nbsp;</td><td id=\"offsetbit"+loop+"\">&nbsp;</td></tr></table></div>";
        }
    else{
        strtowrite+="<tr><td><input type=\"text\" id=\"tagIB"+loop+"\" placeholder=\"tag\" disabled></input></td><td><input type=\"text\" id=\"index"+loop+"\" name=\"index"+loop+"\" placeholder=\"index\" disabled></input></td><td><input type=\"text\" id=\"offsetIB"+loop+"\" placeholder=\"offset\" disabled></input></td></tr><tr><td id=\"tagbit"+loop+"\">  &nbsp;</td><td id=\"indexbit"+loop+"\">&nbsp;</td><td id=\"offsetbit"+loop+"\">&nbsp;</td></tr></table></div>";
        }
    strtowrite+="</div>"
    return strtowrite;
}

function breakInstruction()
{
	instructionsType=[];
    instructionsData=[];
	
    var string = document.getElementById("analysisInstructionTA").value;
    instructionsLine = string.split(",");
    var okay = true;
    for (var i=0;i<instructionsLine.length;i++)
    {
		var single_instruction = instructionsLine[i].split("-");
        var number = parseInt(single_instruction[1],16).toString(16).toUpperCase();
        var binary = parseInt(number,16).toString(2);
        var instructionInt = parseInt(number,16).toString(10);
        if (instructionInt<0 || instructionInt>memory ||isNaN(instructionInt))
        {
            alert("List of Instruction should be in HEX. Ensure you have submitted the configuration and try again.");
            document.getElementById("analysisInstructionTA").focus();
            okay =false;
            break;
        }
        else{
            instructionsData.push(number);
			instructionsType.push(single_instruction[0].replace(/ /g,''));
        }
            
    }
    if (okay){
            document.getElementById('submit').disabled = true;	
            instructionRouter(instructionsData[0], instructionsType[0]);
    }
}
function instructionRouter(hex, type){
	loadInstruction(hex);
	listOfInstructions.push(hex);	
	writeThroughBack = $("input[name=WriteThroughBack]:checked").val();
	writeAllocateAround = $("input[name=WriteAllocateAround]:checked").val();
	if (type=="L"){
		listOfInstructionsLW.push("Load");

	}
	else
	{
		listOfInstructionsLW.push("Store");

	}
			procInstruction();
}

function loadInstruction(hex)
{
	if (sessionstart)
	{
		var binary = parseInt(hex,16).toString(2);
        var arraytoDisplay = document.getElementById("analysisInstructionTA").value.split(",").slice(1);
		document.getElementById("analysisInstructionTA").value = arraytoDisplay.toString(16);
        while (binary.length < memoryBit){binary = "0"+ binary;}
        for (var cacheLoop=1; cacheLoop<=4;cacheLoop++){
            var afterindex = parseInt(tagBit[cacheLoop]) + parseInt(cacheBit[cacheLoop]);
            if (cacheType[cacheLoop]!="Fully Associative Cache")
                {
                    //WRITE TAG
                    if (binary.substr(0,tagBit[cacheLoop])>0){
                        document.getElementById(("tagIB"+cacheLoop)).value = binary.substr(0,tagBit[cacheLoop]);
                    }
                    else
                    {
                        document.getElementById(("tagIB"+cacheLoop)).value =0;
                    }
                    //WRITE INDEX
                    if (binary.substr(tagBit[cacheLoop],cacheBit[cacheLoop])>0){
                        document.getElementById(("index"+cacheLoop)).value = binary.substr(tagBit[cacheLoop],cacheBit[cacheLoop]);
                    }
                    else
                    {
                        document.getElementById(("index"+cacheLoop)).value =0;
                    }
                }
            else{
                if (binary.substr(0,(tagBit[cacheLoop]+cacheBit[cacheLoop]))>0){
                      document.getElementById(("tagIB"+cacheLoop)).value = binary.substr(0,(tagBit[cacheLoop]+cacheBit[cacheLoop]));}
                else{document.getElementById(("tagIB"+cacheLoop)).value=0;}

            }
            if (binary.substr(afterindex)>0){
                document.getElementById(("offsetIB"+cacheLoop)).value = binary.substr(afterindex);
            }
            else
            {
                document.getElementById(("offsetIB"+cacheLoop)).value =0;
            }
            block = parseInt(binary.substr(0,afterindex),2).toString(16);
        }

        document.getElementById('currentInstructionDiv').innerHTML = hex;


	}
	else
	{
		alert ("Please Specify Cache Configuration First!");
	}
}

function procInstruction(){
    for (var cacheLoop = 1; cacheLoop<=4; cacheLoop++)
    {
        for (var ca=0; ca<setAssociative[cacheLoop]; ca++)
        {
           for (var rows=0; rows<validBitArray[cacheLoop][ca].length; rows++)
            {
            document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+rows)).style.backgroundColor = "";   
			document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+rows)).style.backgroundColor = "";   
            }
        }
    }
    for (var cacheLoop = 1; cacheLoop<=4; cacheLoop++)
        {
            if (cacheType[cacheLoop]!="Fully Associative Cache")
                {
                var indexP = parseInt(document.getElementById(("index"+cacheLoop)).value,2);                    
                }
            else
                {
                var indexP = parseInt(document.getElementById(("tagIB"+cacheLoop)).value,2);
                }

            if (cacheType[cacheLoop]=="Direct Mapped Cache")
            {
                resourceNAND[cacheLoop]+=2;
                var ca=0;
                var validP = document.getElementById(("valid"+cacheLoop+"_"+ca+"_"+indexP)).value;
                if (validBitArray[cacheLoop][ca][indexP]==0)
                    {
							miss[cacheLoop]++;
							listOfInstructionsTF[cacheLoop].push(0);
						if ((writeAllocateAround=="Write Allocate" && instructionsType[0]=="S")||(instructionsType[0]=="L")){


							validBitArray[cacheLoop][ca][indexP]=1;
							validTagArray[cacheLoop][ca][indexP]= document.getElementById(("tagIB"+cacheLoop)).value;
							validDataArray[cacheLoop][ca][indexP] = ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();

							document.getElementById(("valid"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML=1;
							document.getElementById(("tag"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validTagArray[cacheLoop][ca][indexP];
							document.getElementById(("offset"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validDataArray[cacheLoop][ca][indexP];
							document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#F0CCCC";    
						}                        

                    }
                else 
                    {
                        resourceNAND [cacheLoop]+=4*tagBit[cacheLoop]; //Compare tags when validbit = 1
                        if (validTagArray[cacheLoop][ca][indexP]==(document.getElementById(("tagIB"+cacheLoop)).value))
                            {
								
                                hit[cacheLoop]++;   
                               listOfInstructionsTF[cacheLoop].push(1); 
							   if (writeThroughBack=="Write Back" && instructionsType[0]=="S" ){
									validDirtyBitArray[cacheLoop][ca][indexP]=1;
									document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML=1;
									document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#F0CCCC";    
								   
							   }

							   document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#00AA00";  
                            }
                        else {
                            miss[cacheLoop]++;
                            listOfInstructionsTF[cacheLoop].push(0); 
							if((writeAllocateAround=="Write Allocate" && instructionsType[0]=="S")||(instructionsType[0]=="L")){
								validDirtyBitArray[cacheLoop][ca][indexP]=0;
								validTagArray[cacheLoop][ca][indexP]= document.getElementById(("tagIB"+cacheLoop)).value;
								validDataArray[cacheLoop][ca][indexP] = ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();
								
								document.getElementById(("tag"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validTagArray[cacheLoop][ca][indexP];
								document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validDirtyBitArray[cacheLoop][ca][indexP];
								document.getElementById(("offset"+cacheLoop+"_"+ca+"_"+indexP)).innerHTML = validDataArray[cacheLoop][ca][indexP];
								document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+indexP)).style.backgroundColor = "#F0CCCC"; 
							}							
                        }
                    }
            }
            else if (cacheType[cacheLoop]=="Fully Associative Cache")
                {
                    var ca= 0;
                    var noValidBit = 0;
                    for (var no=0; no<validBitArray[cacheLoop][ca].length; no++)
                        {
                            if (validBitArray[cacheLoop][ca][no]==1)
                                {
                                    noValidBit++;
                                }
                        }
                    resourceNAND[cacheLoop]+=cache[cacheLoop]*2 + tagBit[cacheLoop]*4 * noValidBit;

                    var localValid = false;
                    for (var cacheLength=0; cacheLength<validTagArray[cacheLoop][ca].length; cacheLength++)
                        {
                            if (validTagArray[cacheLoop][ca][cacheLength] == indexP)
                                {
                                    localValid=true;
                                    LRUIndex[cacheLoop] = cacheLength;
                                }
                        }
                    if (localValid)
                        {
                            hit[cacheLoop]++;
                            listOfInstructionsTF[cacheLoop].push(1); 
						   if (writeThroughBack=="Write Back" && instructionsType[0]=="S" ){
									validDirtyBitArray[cacheLoop][ca][LRUIndex[cacheLoop]]=1;
									document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+LRUIndex[cacheLoop])).innerHTML=1;
									document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+LRUIndex[cacheLoop])).style.backgroundColor = "#F0CCCC";    
								   
							   }
				            if (cacheReplacementPolicy =="LRU")
                            {
                                var index = LRU[cacheLoop][ca].indexOf(LRUIndex[cacheLoop]);
                                if (index>-1)
                                {

                                    LRU[cacheLoop][ca].splice(index, 1);
                                }
                                LRU[cacheLoop][ca].push(LRUIndex[cacheLoop]);
                            } document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+LRUIndex[cacheLoop])).style.backgroundColor = "#00AA00"; 
                        }
                    else{
                        

						if ((writeAllocateAround=="Write Allocate" && instructionsType[0]=="S")||(instructionsType[0]=="L")){
							//REPLACEMENTPOLICY CONFIGURATION
							if (cacheReplacementPolicy=="LRU")
							{
								var x = LRU[cacheLoop][ca].shift();
								LRUIndex[cacheLoop] = x;
								LRU[cacheLoop][ca].push(x);
								counter[cacheLoop] = x;
							}
						
						
							validDirtyBitArray[cacheLoop][ca][counter[cacheLoop]]=0;
							validBitArray[cacheLoop][ca][counter[cacheLoop]]=1;
							validTagArray[cacheLoop][ca][counter[cacheLoop]]=indexP;
							validDataArray[cacheLoop][ca][counter[cacheLoop]] = ("Block "+block+" Word 0 - "+ offsetrange).toUpperCase();
							document.getElementById(("dirtybit"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML=0;
							document.getElementById(("valid"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML=1;
							document.getElementById(("tag"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML = validTagArray[cacheLoop][ca][counter[cacheLoop]];
							document.getElementById(("offset"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).innerHTML = validDataArray[cacheLoop][ca][counter[cacheLoop]];
							document.getElementById(("tr"+cacheLoop+"_"+ca+"_"+counter[cacheLoop])).style.backgroundColor = "#F0CCCC";    
							LRUIndex[cacheLoop] = counter[cacheLoop];
							if (counter[cacheLoop]<(cache[cacheLoop]-1))
							{counter[cacheLoop]++;}
							else {counter[cacheLoop]=0;}
							}
						miss[cacheLoop]++;
                        listOfInstructionsTF[cacheLoop].push(0); 


                    }
                }
            else{ //2 AND 4 WAY SET ASSOCIATIVE
                var ca= setAssociative[cacheLoop];
                var noValidBit = 0;
                var validP =[];
                var tagP =[];
                for (var ca=0; ca<setAssociative[cacheLoop];ca++)
                    {

                        counter[cacheLoop]=[];
                        validP[ca] = validBitArray[cacheLoop][ca][indexP];
                        tagP[ca]=validTagArray[cacheLoop][ca][indexP];
                        if (validP==1)
                            {
                                noValidBit++;
                            }
                    }
                resourceNAND[cacheLoop] += ca*2 + noValidBit * 4 *tagBit[cacheLoop];
                var tagIBC = parseInt(document.getElementById(("tagIB"+cacheLoop)).value,2);  
                if (validP.indexOf(1)==-1)
                {
					if ((writeAllocateAround=="Write Allocate" && instructionsType[0]=="S")||(instructionsType[0]=="L")){
						var id = LRUIndex[cacheLoop][indexP];
							if (cacheReplacementPolicy == "LRU")
							{
								id = LRU[cacheLoop][indexP].shift();
								LRUIndex[cacheLoop][indexP] = id;
								LRU[cacheLoop][indexP].push(id);
							}

						validBitArray[cacheLoop][id][indexP]=1;
						validTagArray[cacheLoop][id][indexP]= tagIBC;
						validDataArray[cacheLoop][id][indexP]=("B. "+block+" W. 0 - "+ offsetrange).toUpperCase();
						document.getElementById(("valid"+cacheLoop+"_"+id+"_"+indexP)).innerHTML=1;
						document.getElementById(("tag"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= validTagArray[cacheLoop][id][indexP];
						document.getElementById(("offset"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= 
							validDataArray[cacheLoop][id][indexP];
						document.getElementById(("tr"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#F0CCCC";  
						if (LRUIndex[cacheLoop][indexP]<setAssociative[cacheLoop])
							{
								LRUIndex[cacheLoop][indexP]++;
							}
						else { LRUIndex[cacheLoop][indexP] = 0;}
					}
                    miss[cacheLoop]++;
                    listOfInstructionsTF[cacheLoop].push(0); 
                }
                else{
                    if (tagP.indexOf(tagIBC)==-1)
                        {



						if ((writeAllocateAround=="Write Allocate" && instructionsType[0]=="S")||(instructionsType[0]=="L")){
							var id = LRUIndex[cacheLoop][indexP];   
							//REPLACEMENTPOLICY CONFIGURATION                            
							if (cacheReplacementPolicy == "LRU")
							{
								id = LRU[cacheLoop][indexP].shift();
								LRUIndex[cacheLoop][indexP] = id;
								LRU[cacheLoop][indexP].push(id);
							}
							validDirtyBitArray[cacheLoop][id][indexP]=0;
							validBitArray[cacheLoop][id][indexP]=1;
							validTagArray[cacheLoop][id][indexP]= tagIBC;
							validDataArray[cacheLoop][id][indexP]=("B. "+block+" W. 0 - "+ offsetrange).toUpperCase();
							document.getElementById(("dirtybit"+cacheLoop+"_"+id+"_"+indexP)).innerHTML=0;
							document.getElementById(("valid"+cacheLoop+"_"+id+"_"+indexP)).innerHTML=1;
							document.getElementById(("tag"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= tagIBC;
							document.getElementById(("offset"+cacheLoop+"_"+id+"_"+indexP)).innerHTML= 
								validDataArray[cacheLoop][id][indexP];
							document.getElementById(("tr"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#F0CCCC";   
							if (LRUIndex[cacheLoop][indexP]<(setAssociative[cacheLoop]-1))
							{
								LRUIndex[cacheLoop][indexP]++;
							}
							else { LRUIndex[cacheLoop][indexP] = 0;}
						}
                        miss[cacheLoop]++;
						  listOfInstructionsTF[cacheLoop].push(0);  
                        }
                    else //TAG is FOUND in the EXISTING CACHE
                        {
                            var id = tagP.indexOf(tagIBC);
						   if (writeThroughBack=="Write Back" && instructionsType[0]=="S" ){
									validDirtyBitArray[cacheLoop][id][indexP]=1;
									document.getElementById(("dirtybit"+cacheLoop+"_"+id+"_"+indexP)).innerHTML=1;
									document.getElementById(("dirtybit"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#F0CCCC";    
								   
							   }
                                                    
                        if(cacheReplacementPolicy=="LRU")
				        {
						var index = LRU[cacheLoop][indexP].indexOf(id);
						LRUIndex[cacheLoop][indexP] = index;

							if (index>-1)
								{
									LRU[cacheLoop][indexP].splice(index, 1);
								}
								LRU[cacheLoop][indexP].push(id);
								
				        }
                            hit[cacheLoop]++;
                           listOfInstructionsTF[cacheLoop].push(1);  document.getElementById(("tr"+cacheLoop+"_"+id+"_"+indexP)).style.backgroundColor = "#00AA00";  
                        }
                }
            }
        //UPDATE HIT MISS RESOURCE RATE
        updateStatistics(cacheLoop);
		}
        updateChartBody();
        if (instructionsData.length<2)
        {
          document.getElementById('submit').disabled = false;          
        }
}
function updateChartBody(){
     //['ID', 'Resource Needed', 'Hit Rate', 'Cache Type',     'Cache Size'],

        for (cacheLoop = 1; cacheLoop<=4; cacheLoop++)
        {
            var hitRate = Math.round(hit[cacheLoop]/listOfInstructions.length *100,2);
            chartBody[chartcounter] = [];
            chartBody[chartcounter].push("");
            chartBody[chartcounter].push(resourceNAND[cacheLoop]);
            chartBody[chartcounter].push(hitRate);
            chartBody[chartcounter].push((cacheType[cacheLoop] + cacheLoop));
            chartBody[chartcounter].push((cache[cacheLoop]*offset *setAssociative[cacheLoop]));
            chartcounter++;
        }
}
function nextInstruction(){
    
    instructionsData.shift();
	instructionsType.shift();
    if (instructionsData.length>0)
        {
            instructionRouter(instructionsData[0], instructionsType[0]);
        }
    else{
        alert ("Please submit new instructions");
        document.getElementById('submit').disabled = false;   
    }
    
}
function resetInstruction(){
    document.getElementById("analysisInstructionTA").value="";
    document.getElementById('submit').disabled = false;  
    document.getElementById("currentInstructionDiv").innerHTML="";
    var temp = chartBody[0];
    chartBody =[];
    chartcounter=0;
    chartBody[0] = temp;
    chartcounter = 1;
    Initialise();
    loadConfiguration();
}
function ffInstruction(){
    if (document.getElementById('submit').disabled ==false)
        {
            alert ("Please Submit Instructions first");
        }
    else
    {
        while (instructionsData.length>1)
            {
                instructionsData.shift();
				instructionsType.shift();
                instructionRouter(instructionsData[0],instructionsType[0]);
            }
        alert ("Done");
    }
}
function randomArray()
{
    var arInst =[];
    var arInstLS =[];
	var arCombine=[];
	var strRet = "";
    for (var ct=0;ct<88; ct++)
        {
          arInst.push(Math.floor(Math.random() * memory).toString(16));  
		  arInstLS.push(Math.floor(Math.random()*2));
          if (arInstLS[ct]==0)
		  {
			  strRet="L-";
		  }
		  else{
			  strRet="S-";
		  }
		  arCombine[ct]=strRet+arInst[ct];
        }	
    document.getElementById("analysisInstructionTA").value = arCombine.toString();
    
}

function rndConfiguration()
{
    var rndOffset= Math.ceil(Math.random() * 4)
    document.getElementById('offsetsize').value = rndOffset;
    var rndMemory = Math.floor(Math.random() *15)+ rndOffset + 1;
	document.getElementById('memorysize').value = Math.pow(2,rndMemory);
    for (var cacheLoop=1; cacheLoop<=4;cacheLoop++)
        {
            var rndType =  Math.floor(Math.random() *4);
            document.getElementById(("cache"+cacheLoop+"type")).options[rndType].selected = 'selected';
            var rndCache = Math.floor(Math.random() *(rndMemory-rndOffset-rndType)) + rndOffset + rndType;
            document.getElementById(("cache"+cacheLoop+"_size")).value = Math.pow(2,rndCache);            
            
        }
      
}

function resetConfigurationAnalysis(){
	    for (var cacheLoop=1; cacheLoop<=4; cacheLoop++)
		{
			document.getElementById(("cache"+cacheLoop+"_size")).disabled = false;
			document.getElementById(("cache"+cacheLoop+"type")).disabled = false;
		}
        document.getElementById('memorysize').disabled = false;
        document.getElementById('offsetsize').disabled = false;
		document.getElementById('submit').disabled = false;
        document.getElementById('submitConfig').disabled = false;
		document.getElementById('rndButton').disabled = false;
		location.reload();
}
function LRUController(){

}
function updateStatistics(loop){
	var listofPrevIns="<ul>";
		for (p=0;p<listOfInstructions.length;p++)
		{
            var cacheResult="";
            for (j=1; j<=4; j++)
                {
                if (listOfInstructionsTF[j][p]==0)
                {
                    cacheResult += "M";
                }
                else {
                    cacheResult += "H";
                }
                if (j!=4) {cacheResult +=" | ";}
                }
        
			listofPrevIns +="<li> "+listOfInstructionsLW[p]+" "+listOfInstructions[p].toUpperCase()+" [" + cacheResult+"] </li>"; 
		}
		listofPrevIns +="</ul>";
		document.getElementById('listOfInstructionsLabel').innerHTML = listofPrevIns;
        var hitRate = hit[loop]/listOfInstructions.length;
        var missRate = miss[loop]/listOfInstructions.length;
        document.getElementById(("hitrate"+loop)).innerHTML =  Math.round(hitRate*100,2) +"%";
        document.getElementById(("missrate"+loop)).innerHTML = Math.round(missRate*100,2) +"%";
        document.getElementById(("resource"+loop)).innerHTML = resourceNAND[loop];
        
	
}