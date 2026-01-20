
import 'package:code_editor/controller/cpp_code_controller.dart';
import 'package:code_editor/controller/java_code_controller.dart';
import 'package:code_editor/controller/python_code_controller.dart';
import 'package:code_editor/views/nav_screens/ai_chat_screen.dart';
import 'package:code_editor/views/nav_screens/home_screen.dart';
import 'package:code_text_field/code_text_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_highlight/themes/monokai-sublime.dart';
import 'package:highlight/languages/python.dart';
import 'package:highlight/languages/java.dart';
import 'package:highlight/languages/cpp.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:undo_redo/undo_redo.dart';
class CodeEditorScreen extends StatefulWidget {
  final String regex;
  final String defaultCode ;
  final language;

  const CodeEditorScreen({super.key,required this.regex,required this.defaultCode,required this.language});

  @override
  State<CodeEditorScreen> createState() => _CodeEditorScreenState();
}

class _CodeEditorScreenState extends State<CodeEditorScreen> {



  final UndoRedoManager<String> _undoRedoManager = UndoRedoManager<String>();
  Map<String,dynamic> output = {};
  bool isRunning = false;
  CodeController? codeController;
  final languageSupport = {
    'java':java,
    'python':python,
    'cpp':cpp
  };
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    codeController = CodeController(
      text:widget.defaultCode ,
      params: EditorParams(
        tabSpaces: 2,
      ),
      modifiers: const [IndentModifier(handleBrackets: true), CloseBlockModifier(), TabModifier()],
      language: languageSupport[widget.language],
    );
    _undoRedoManager.initialize(widget.defaultCode);
  }

  void changeData(String value) {

      setState(() {
        _undoRedoManager.captureState(value);
      });

  }


  void undo(){
    final previous = _undoRedoManager.undo();
    if(previous!=null){
      setState(() {
        codeController!.text = previous;
      });
    }
  }
  void redo(){
    final next = _undoRedoManager.redo();
    if(next!=null){
      setState(() {
        codeController!.text = next;
      });
    }
  }




  List<String> extractInputFromCode() {
    final code = codeController!.text;
    final regex = RegExp(widget.regex);//RegExp('input\s*\((["\'](.*?)["\']\s*)?\)');
    final matches = regex.allMatches(code);

    List<String> prompts = [];
    int count = 1;

    for (final match in matches) {
      final promptText = match.group(2); // gets content inside quotes
      if (promptText != null && promptText.trim().isNotEmpty) {
        prompts.add(promptText);
      } else {
        prompts.add('Input #$count');
      }
      count++;
    }

    return prompts;
  }


  Future<List<String>> showInputDialog(List<String> prompts)async{
    List<String> inputs = List.filled(prompts.length, '');
    return await showDialog(
        context: context, 
        builder: (context){
          return AlertDialog(
            title: Text("Inputs"),
            content: SingleChildScrollView(
              child: Column(
                children: List.generate(
                    prompts.length,
                    (index){
                      return Padding(
                          padding: EdgeInsets.all(12),
                        child: TextField(
                          decoration: InputDecoration(
                            label:Text(prompts[index])
                          ),
                          onChanged: (value){
                            inputs[index]=value;
                          },
                        ),
                      );
                    }
                )
              ),
            ),
            actions: [
              TextButton(
                  onPressed: (){
                    Navigator.of(context).pop(inputs);
                  },
                  child: Text("Run")
              )
            ],
          );
        }
    );
  }
  


  @override
  void dispose() {
    // TODO: implement dispose
    super.dispose();
    codeController!.dispose();
    _undoRedoManager.dispose();
  }



  Future<void> runCode(String input)async{
    setState(() {
      isRunning = true;
    });
    String code = codeController!.text;
    if(widget.language == 'python'){
      output = await PythonCodeController().runCode(code, input);
    }
    else if(widget.language == 'java'){
      output = await JavaCodeController().runCode(code, input);
    }
    else{
      output = await CppCodeController().runCode(code, input);
    }
    setState(() {
      isRunning=false;
    });
    final isError = output['stderr'].isNotEmpty;
    showModalBottomSheet(
        context: context,
        showDragHandle: true,
        enableDrag: true,
        isScrollControlled: true,
        builder: (context){
          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                    child: IconButton(
                        onPressed: ()=>Navigator.pop(context),
                        icon: Icon(
                          Icons.cancel,
                          size: 45,
                        )
                    )
                ),
                Center(
                  child: Text(
                    "Output",
                    style: GoogleFonts.sourceCodePro(
                      fontSize: 45,
                      fontWeight: FontWeight.bold
                    ),
                  ),
                ),
                Divider(
                  endIndent: 45,
                  indent: 45,
                ),
                Padding(
                  padding: const EdgeInsets.all(12.0),
                  child: Text(
                    isError ? output['stderr']  : output['stdout'],
                    style: GoogleFonts.roboto(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isError ? Colors.red : Colors.black
                    ),
                  ),
                ),
                SizedBox(height: 500,)
              ],
            ),
          );
        }
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade900,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
            "Code Editor",
            style: GoogleFonts.sourceCodePro(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white
            ),
        ),
        leading: IconButton(
            onPressed:()=>Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(
                    builder: (_)=>HomeScreen()
                ),
                    (route)=>false
            ),
            icon: Icon(Icons.home_outlined,color: Colors.white,size: 30,)
        ),
        actions: [
          // IconButton(
          //   onPressed: ()=>_undoRedoManager.canRedo() ? undo() : null,
          //   icon: Icon(Icons.arrow_back_ios_new_rounded,size:30,color: _undoRedoManager.canUndo() ? Colors.white : Colors.grey,),
          //   color: Colors.white,
          // ),
          // IconButton(
          //     onPressed: ()=> _undoRedoManager.canRedo() ? redo() : null,
          //     icon: Icon(Icons.arrow_forward_ios_rounded,size:30,color: _undoRedoManager.canRedo() ? Colors.white : Colors.grey,),
          //   color: Colors.white,
          // )
        ],
      ),
      body: SingleChildScrollView(
        child: CodeTheme(
            data: CodeThemeData(styles: monokaiSublimeTheme),
            child: SingleChildScrollView(
              child: CodeField(
                  controller: codeController!,
                onChanged: (value){
                    changeData(value);
                },
                smartQuotesType: SmartQuotesType.enabled,
                textStyle: GoogleFonts.firaCode(
                  fontWeight: FontWeight.w600,
                  fontSize: 12
                ),
                enabled: true,
                horizontalScroll: true,
                isDense: true,
              ),
            )
        ),
      ),
      floatingActionButton: FloatingActionButton(
          onPressed: isRunning ? null :  ()async{
            final prompts = extractInputFromCode();
            String combinedInput = '';
            if (prompts.isNotEmpty) {
              final inputList = await showInputDialog(prompts);
              combinedInput = inputList.join('\n');
            }
            await runCode(combinedInput); // Run code with or without input
          },
        backgroundColor: Colors.green,
        child: isRunning ? Center(child: CircularProgressIndicator(color: Colors.white,),) : Icon(Icons.arrow_forward_ios_rounded,size: 30,color: Colors.white,),
      ),
    );
  }
}
