///////////////////////////////////////UTILITIES/////////////////////////////
function checkPowerOfTwo(arbitaryNumber)
{
	if (Math.pow(2,(Math.log(arbitaryNumber)/Math.log(2)))==arbitaryNumber)
	{
		return true;
	}
	else
	{
		return false;
	}
}
function logtwo(arbitaryNumber)
{
	return (Math.log(arbitaryNumber)/ Math.log(2));
}	
function initialiseHypenArray (numrows) {
		var arr = new Array ();
		for (i=0; i<numrows; i++){
			arr[i]="-";
		}
		return arr;
}
function initialiseZeroArray (numrows) {
		var arr = new Array ();
		for (i=0; i<numrows; i++){
			arr[i]=0;
		}
		return arr;
}
function initialiseNumberedArray (numrows) {
		var validTagArray = new Array ();
		for (i=0; i<numrows; i++){
			validTagArray[i]=i;
		}
		return validTagArray;
}

function generateRandomNumber()
{
    var arInst =[];
    for (var ct=0;ct<10; ct++)
        {
          arInst.push(Math.floor(Math.random() * memory).toString(16));  
        }
    document.getElementById("list_of_instruction").value = arInst.toString();
    pushNoToLoad();
    
}

///////////////////////////////END OF UTILITIES/////////////////////////////



///////////////////////////// SET UP CONFIGURATION////////////////////////////////////////
function setFirstTableGeneric(tagBit, offsetBit){

	document.getElementById("tagbit").innerHTML= tagBit + " bit";
	document.getElementById("offsetbit").innerHTML= offsetBit + " bit";	
	document.getElementById('cachesize').disabled = true;
	document.getElementById('memorysize').disabled = true;
	document.getElementById('offsetsize').disabled = true;
}
function loadTable(){
	var whattowrite="<table class=drawtable id=cachetable>"+
						"<tr>"+
							"<td  id=marker-1> Línea</td>"+
							"<td> Válido </td>"+
							"<td> Etiqueta </td>"+
							"<td> Dato (Hex) </td>"+
							"<td> Dirty Bit </td>"+
						"</tr>";
	for (z = 0; z< cache; z++) { 
    whattowrite += "<tr id=tr"+z+">"+
						"<td id=marker"+z+">"+z+"</td>"+
						"<td id=valid"+z+"> "+validBitArray[z]+"</td>"+
						"<td id=tag"+z+">"+ validTagArray[z] + "</td>"+
						"<td id=offset"+z+">"+ validDataArray[z]+"</td>"+
						"<td id=dirtybit"+z+">"+ validDirtyBitArray[z]+"</td>"+
					"</tr>";
	}
	whattowrite +="</table>";
	return whattowrite;


}
function setmemorytable(){
	var writeTable ="<table>";
	for (var rows=0; rows< Math.pow(2,(memoryBit-offsetBit)); rows++)
	{
		writeTable +="<tr id= memoryRow"+rows+">";
		for (var cells=0; cells<offset; cells++)
		{
			writeTable+="<td id= memory"+rows+cells+"> B. "+rows.toString(16).toUpperCase()+" P. " + cells.toString(16).toUpperCase() +"</td>";
		}
		writeTable +="</tr>";
	}
	writeTable+="</table>";
	document.getElementById("memoryblocks").innerHTML = writeTable;
	
}
function instructionBreakdownProcess(type)
{
	if (sessionstart)
	{
		var hex = document.getElementById('instruction_data').value;
        if (hex=="")
            {
                pushNoToLoad();
                hex = document.getElementById('instruction_data').value;
            }
		var binary = parseInt(hex,16).toString(2);
		var instructionInt = parseInt(hex,16).toString(10);

		
		if (instructionInt<0 || instructionInt>(memory-1) ||isNaN(instructionInt))
		{
			document.getElementById('instruction_data').value = 0;
			alert("La instrucción no es válida. Inténtalo de nuevo");
		}
		else{

			while (binary.length < memoryBit)
			{
				binary = "0"+ binary;
			}
			if (tagBit==0){
					document.getElementById("tag").value =0;			
			}
			else{
				document.getElementById("tag").value = binary.substr(0,tagBit);
				}
			if (type!="fa"){
				var afterindex = parseInt(tagBit) + parseInt(cacheBit);
				if (cacheBit==0){
					document.getElementById("index").value =0;					
				}
				else{
				document.getElementById("index").value = binary.substr(tagBit,cacheBit);
				}

				validindex = parseInt(document.getElementById("index").value,2) ;
			}
			else{
				var afterindex = parseInt(tagBit);
			}
			if (afterindex!=binary.length){
			document.getElementById("offset").value = binary.substr(afterindex);
			}
			else
			{
				document.getElementById("offset").value =0;
			}
			block = parseInt(binary.substr(0,afterindex),2).toString(16);
			step = 0;
			hitBoolean = false;

			document.getElementById('instruction_data').disabled = true;
			document.getElementById("InstructionType").disabled = true;
			document.getElementById('submit').disabled = true;	
			listOfInstructions.push(hex);
			document.getElementById('hitmiss').style.backgroundColor="";
			document.getElementById('genRandom').style.backgroundColor="";	
			document.getElementById('instruction_data').focus();
           

		}
	}
	else
	{
		alert ("Especifique primero la configuración de caché!");
		return false;
	}
	return true;
}
////////////////////////// END OF SET UP CONFIGURATION//////////////////////////////////////////////////
///////////////////PRINT CONFIGURATION///////////////////////////////
function printConfiguration()
{
    return(" Palabra = " + offsetBit+ " bits"+
                "<br> Bits de bloque = log<sub>2</sub>("+(cache*offset)+"/"+ offset+") = "+ cacheBit + " bits"+
                "<br> Longitud de la instrucción = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Etiqueta = "+ memoryBit + " bits - " + offsetBit + " bits - " + cacheBit +" bits = " +tagBit+" bits"+
                "<br> Bloque = "+tagBit +" bits + " +cacheBit+" bits = "+ (tagBit+cacheBit)+ " bits"+
                "<br><br> Por favor envíe la instrucción.");
}
function printConfigurationSA2()
{
    return(" Palabra = " + offsetBit+ " bits"+
                "<br> Bits de bloque = log<sub>2</sub>("+(cache*offset*2)+"/"+ offset+"/2) = "+ cacheBit + " bits"+
                "<br> Longitud de la instrucción = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Etiqueta = "+ memoryBit + " bits - " + offsetBit + " bits - " + cacheBit +" bits = " +tagBit+" bits"+
                "<br> Bloque = "+tagBit +" bits + " +cacheBit+" bits = "+ (tagBit+cacheBit)+ " bits"+
                "<br><br> Por favor envíe la instrucción.");
}
function printConfigurationSA4()
{
    return(" Palabra = " + offsetBit+ " bits"+
                "<br> Bits de bloque = log<sub>2</sub>("+(cache*offset*4)+"/"+ offset+"/4) = "+ cacheBit + " bits"+
                "<br> Longitud de la instrucción = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Etiqueta = "+ memoryBit + " bits - " + offsetBit + " bits - " + cacheBit +" bits = " +tagBit+" bits"+
                "<br> Bloque = "+tagBit +" bits + " +cacheBit+" bits = "+ (tagBit+cacheBit)+ " bits"+
                "<br><br> Por favor envíe la instrucción.");
}
function printConfigurationVM()
{
    return(" Palabra = " + offsetBit+ " bits"+
                "<br> Longitud de la instrucción = log<sub>2</sub>("+memory+") = "+memoryBit+ " bits"+
                "<br> Filas de página física = "+physicalpage + " / 2^ " + offsetBit +" = "+physicalMemoryRows  + " rows"+
                "<br> Filas de tabla de página = "+memory+ " / 2^" + offsetBit +" = "+ zmemory + " rows"+                
                "<br> TLB Filas= "+ TLB+ " rows"+
                "<br><br> Por favor envíe la instrucción.");
}
//////////////////PRINT CONFIGURATION///////////////////////////////

/////////////////////////////////////SIMULATION RUNNING //////////////////////////////////
function instruction(type){

	var instructionBreakdownProcessSuccess = instructionBreakdownProcess(type);
	
	if (instructionBreakdownProcessSuccess){
	if (document.getElementById("InstructionType").value =="Load") {
		instructionLoadExecuteSteps();  
					listOfInstructionsLS.push("Load");
   
	}
	else{
		storeInstruction();
		listOfInstructionsLS.push("Store");		
	}
	}

}
function instructionLoadOrStore(){
		if (document.getElementById("InstructionType").value =="Load"){
		instructionLoadExecuteSteps();  
   
	}
	else{
		storeInstruction();
	}
}
function step0(){
		window.scroll(0,0);
		document.getElementById("information_text").innerHTML ="La instrucción se convirtió de hexadecimal a binario y se asignó a etiqueta, bloque y palabra, respectivamente.";
		document.getElementById("information_text").style.backgroundColor="#F0CCCC";
		document.getElementById("tag").style.backgroundColor="#F0CCCC";
		var indexisExists = document.getElementById("index");
		if (indexisExists)
			document.getElementById("index").style.backgroundColor="#F0CCCC";
		document.getElementById("offset").style.backgroundColor="#F0CCCC";
		document.getElementById("next").disabled=false;
		document.getElementById("fastforward").disabled=false;
}

function evaluateValidBit(SA){
	document.getElementById("information_text").innerHTML ="Se obtendrá y analizará el bit válido.";
	document.getElementById("information_text").style.backgroundColor="green";
	if (SA==1){
	document.getElementById(("valid"+validindex)).style.backgroundColor ="green";
	}
	else{
		for (var i=0; i<SA; i++){
			document.getElementById(("valid"+phpNaming[i]+validindex)).style.backgroundColor ="green";		
		}
	}
}
function pushNoToLoad()
{
    var arrInst = document.getElementById("list_of_instruction").value.split(",");
     document.getElementById('instruction_data').value = arrInst.shift();
    document.getElementById("list_of_instruction").value = arrInst.toString();
       
}
function fastForward()
{
	if (document.getElementById("instruction_data").disabled==false)
	{
		alert("Por favor envíe la instrucción de carga");
	}
	else{
		if (document.getElementById("InstructionType").value =="Load"){
			while (step>0 && document.getElementById("instruction_data").disabled==true)
			{
				instructionLoadExecuteSteps(step);
			}
		}
		else if (document.getElementById("InstructionType").value =="VM"){
			while (step>0 && document.getElementById("instruction_data").disabled==true)
			{
				step = executeVMInstruction(step);
			}
		}
		else{
			while (step_store>0 && document.getElementById("instruction_data").disabled==true)
			{
				storeInstruction(step_store);
			}
			
		}
	}

}
function printListOfPrevIns(arr_ListofInstructions, arr_ListofInstructionsTF){
	var listofPrevIns="<ul>";
		for (p=0;p<arr_ListofInstructions.length;p++)
		{
            var cacheResult;
            if (arr_ListofInstructionsTF[p]==0)
                {
                    cacheResult="Fallo";
                }
            else{
                cacheResult="Acierto";
            }
			listofPrevIns +="<li> "+arr_ListofInstructions[p].toUpperCase()+" ["+cacheResult+"] </li>"; 
		}
		listofPrevIns +="</ul>";
	return listofPrevIns;
}
function printListOfPrevInsLS(arr_ListofInstructions, arr_ListofInstructionsTF, arr_ListofInstructionsLS){
	var listofPrevIns="<ul>";
		for (p=0;p<arr_ListofInstructions.length;p++)
		{
            var cacheResult;
            if (arr_ListofInstructionsTF[p]==0)
                {
                    cacheResult="Fallo";
                }
            else{
                cacheResult="Acierto";
            }
			listofPrevIns +="<li> "+ arr_ListofInstructionsLS[p]+ " "+ arr_ListofInstructions[p].toUpperCase()+" ["+cacheResult+"] </li>"; 
		}
		listofPrevIns +="</ul>";
	return listofPrevIns;
}
function endOfInstruction(){
	
	document.getElementById("information_text").innerHTML ="El ciclo se ha completado. <br> Por favor envíe otras instrucciones";
	document.getElementById("information_text").style.backgroundColor="";
	document.getElementById("tag").style.backgroundColor ="";
	document.getElementById('instruction_data').disabled = false;
	document.getElementById('submit').disabled = false;	
	document.getElementById("InstructionType").disabled = false;
	document.getElementById('instruction_data').focus();	
	document.getElementById('hitmiss').style.backgroundColor="yellow";
	document.getElementById('genRandom').style.backgroundColor="blue";	
}
//////////////////////////////////////////END OF SIMULATION RUNNING///////////////////////////

/////////////////////////////////////RESET /////////////////////////////////////////////////
function resetColouring(){
	if (document.getElementById("page"))
	{
		document.getElementById("page").style.backgroundColor ="";
	}
	if (document.getElementById("offset"))
	{
		document.getElementById("offset").style.backgroundColor ="";

	}
	if (document.getElementById("middlebox_frame"))
	{
		document.getElementById("middlebox_frame").style.backgroundColor ="";
		document.getElementById("middlebox_frame").innerHTML ="Frame";
	}	
	if (document.getElementById("middlebox_offset"))
	{
		document.getElementById("middlebox_offset").style.backgroundColor ="";
		document.getElementById("middlebox_offset").innerHTML ="Offset";
	}
	if (document.getElementById("tag"))
	{
		document.getElementById("tag").style.backgroundColor ="";
	}	
	if (document.getElementById("index"))
	{
		document.getElementById("index").style.backgroundColor ="";
	}	
		
	if (document.getElementById("drawingSpace"))
	{
		document.getElementById("drawingSpace").innerHTML="";
	}
}
function resetConfiguration()
{
	document.getElementById('cachesize').disabled = false;
	document.getElementById('memorysize').disabled = false;
	document.getElementById('offsetsize').disabled = false;
	document.getElementById('submitConfig').disabled = false;	
	document.getElementById("instruction_data").disabled=false;
	document.getElementById("submit").disabled=false;
	location.reload();
	
}
////////////////////////////////////END OF RESET ////////////////////////////////////////


//////////////////////////////CONFIGURATION ADJUSTMENT //////////////////////////////
function adjustLRU(){
	cacheReplacementPolicy = $("input[name=ReplacementPolicy]:checked").val();
	LRUController();
}

////////////////////////////// END OF CONFIGURATION ADJUSTMENT //////////////////////////////