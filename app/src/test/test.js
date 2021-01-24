/usr/local/bin/node[31686]: ../src/node_http_parser.cc:728:Local<v8::Value> node::(anonymous namespace)::Parser::Execute(const char *, size_t): Assertion `(execute_depth_) == (0)' failed.
 1: 0x1012d96a5 node::Abort() (.cold.1) [/usr/local/bin/node]
 2: 0x1000a6309 node::Abort() [/usr/local/bin/node]
 3: 0x1000a6171 node::Assert(node::AssertionInfo const&) [/usr/local/bin/node]
 4: 0x1000c40fc node::(anonymous namespace)::Parser::Execute(char const*, unsigned long) [/usr/local/bin/node]
 5: 0x1000c296d node::(anonymous namespace)::Parser::Finish(v8::FunctionCallbackInfo<v8::Value> const&) [/usr/local/bin/node]
 6: 0x100259888 v8::internal::FunctionCallbackArguments::Call(v8::internal::CallHandlerInfo) [/usr/local/bin/node]
 7: 0x100258e1c v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<false>(v8::internal::Isolate*, v8::internal::Handle<v8::internal::HeapObject>, v8::internal::Handle<v8::internal::HeapObject>, v8::internal::Handle<v8::internal::FunctionTemplateInfo>, v8::internal::Handle<v8::internal::Object>, v8::internal::BuiltinArguments) [/usr/local/bin/node]
 8: 0x100258582 v8::internal::Builtin_Impl_HandleApiCall(v8::internal::BuiltinArguments, v8::internal::Isolate*) [/usr/local/bin/node]
 9: 0x100a719d9 Builtins_CEntry_Return1_DontSaveFPRegs_ArgvOnStack_BuiltinExit [/usr/local/bin/node]
Tue Jan 19 02:06:58 PST 2021
