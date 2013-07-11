

function CLASS_HIGHLIGHT(code,syntax){
	//哈希表类
	function Hashtable(){
		this._hash = new Object();
		this.add = function(key,value){
			if(typeof(key)!="undefined"){
				if(this.contains(key)==false){
					this._hash[key]=typeof(value)=="undefined"?null:value;
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
		this.remove		= function(key){delete this._hash[key];}
		this.count		= function(){var i=0;for(var k in this._hash){i++;} return i;}
		this.items		= function(key){return this._hash[key];}
		this.contains	= function(key){return typeof(this._hash[key])!="undefined";}
		this.clear		= function(){for(var k in this._hash){delete this._hash[k];}}
	}

	this._caseSensitive = true;

	//字符串转换为哈希�?
	this.str2hashtable = function(key,cs){
		var _key	= key.split(/,/g);
		var _hash	= new Hashtable();
		var _cs		= true;

		if(typeof(cs)=="undefined"||cs==null){
			_cs = this._caseSensitive;
		} else {
			_cs = cs;
		}

		for(var i in _key){
			if(_cs){
				_hash.add(_key[i]);
			} else {
				_hash.add((_key[i]+"").toLowerCase());
			}
		}
		return _hash;
	}

	//获得需要转换的代码
	this._codetxt = code;
	if(typeof(syntax)=="undefined"){
		syntax = "";
	}

	switch(syntax.toLowerCase()){
		case "sql":
		//是否大小写敏�?
		this._caseSensitive	= false;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("COMMIT,DELETE,INSERT,LOCK,ROLLBACK,SELECT,TRANSACTION,READ,ONLY,WRITE,USE,ROLLBACK,SEGMENT,ROLE,EXCEPT,NONE,UPDATE,DUAL,WORK,COMMENT,FORCE,FROM,WHERE,INTO,VALUES,ROW,SHARE,MODE,EXCLUSIVE,UPDATE,ROW,NOWAIT,TO,SAVEPOINT,UNION,UNION,ALL,INTERSECT,MINUS,START,WITH,CONNECT,BY,GROUP,HAVING,ORDER,UPDATE,NOWAIT,IDENTIFIED,SET,DROP,PACKAGE,CREATE,REPLACE,PROCEDURE,FUNCTION,TABLE,RETURN,AS,BEGIN,DECLARE,END,IF,THEN,ELSIF,ELSE,WHILE,CURSOR,EXCEPTION,WHEN,OTHERS,NO_DATA_FOUND,TOO_MANY_ROWS,CURSOR_ALREADY_OPENED,FOR,LOOP,IN,OUT,TYPE,OF,INDEX,BINARY_INTEGER,RAISE,ROWTYPE,VARCHAR2,NUMBER,LONG,DATE,RAW,LONG RAW,CHAR,INTEGER,MLSLABEL,CURRENT,OF,DEFAULT,CURRVAL,NEXTVAL,LEVEL,ROWID,ROWNUM,DISTINCT,ALL,LIKE,IS,NOT,NULL,BETWEEN,ANY,AND,OR,EXISTS,ASC,DESC,ABS,CEIL,COS,COSH,EXP,FLOOR,LN,LOG,MOD,POWER,ROUND,SIGN,SIN,SINH,SQRT,TAN,TANH,TRUNC,CHR,CONCAT,INITCAP,LOWER,LPAD,LTRIM,NLS_INITCAP,NLS_LOWER,NLS_UPPER,REPLACE,RPAD,RTRIM,SOUNDEX,SUBSTR,SUBSTRB,TRANSLATE,UPPER,ASCII,INSTR,INSTRB,LENGTH,LENGTHB,NLSSORT,ADD_MONTHS,LAST_DAY,MONTHS_BETWEEN,NEW_TIME,NEXT_DAY,ROUND,SYSDATE,TRUNC,CHARTOROWID,CONVERT,HEXTORAW,RAWTOHEX,ROWIDTOCHAR,TO_CHAR,TO_DATE,TO_LABEL,TO_MULTI_BYTE,TO_NUMBER,TO_SINGLE_BYTE,DUMP,GREATEST,GREATEST_LB,LEAST,LEAST_UB,NVL,UID,USER,USERENV,VSIZE,AVG,COUNT,GLB,LUB,MAX,MIN,STDDEV,SUM,VARIANCE");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("'");
		//行注释字�?
		this._lineComment	= "--";
		//转义字符
		this._escape		= "";
		//多行引用开�?
		this._commentOn		= "/*";
		//多行引用结束
		this._commentOff	= "*/";
		//忽略�?
		this._ignore		= "";
		//是否处理标记
		this._dealTag		= false;
		break;

		/*增加php*/

		case "php":
		//是否大小写敏�?
		this._caseSensitive	= false;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("__CLASS__,__FILE__,__FUNCTION__,__LINE__,__METHOD__,abstract,and,array,as,break,case,catch,cfunction,class,clone,const,continue,declare,default,die,do,echo,else,elseif,empty,enddeclare,endfor,endforeach,endif,endswitch,endwhile,eval,exception,exit,extends,final,for,foreach,function,global,if,implements,include,include_once,interface,isset,list,new,old_function,or,php_user_filter,print,private,protected,public,require,require_once,return,static,switch,this,throw,try,unset,use,var,while,xor,ABDAY_1,ABDAY_2,ABDAY_3,ABDAY_4,ABDAY_5,ABDAY_6,ABDAY_7,ABMON_1,ABMON_10,ABMON_11,ABMON_12,ABMON_2,ABMON_3,ABMON_4,ABMON_5,ABMON_6,ABMON_7,ABMON_8,ABMON_9,ALT_DIGITS,AM_STR,ASSERT_ACTIVE,ASSERT_BAIL,ASSERT_CALLBACK,ASSERT_QUIET_EVAL,ASSERT_WARNING,CASE_LOWER,CASE_UPPER,CHAR_MAX,CODESET,CONNECTION_ABORTED,CONNECTION_NORMAL,CONNECTION_TIMEOUT,COUNT_NORMAL,COUNT_RECURSIVE,CREDITS_ALL,CREDITS_DOCS,CREDITS_FULLPAGE,CREDITS_GENERAL,CREDITS_GROUP,CREDITS_MODULES,CREDITS_QA,CREDITS_SAPI,CRNCYSTR,CRYPT_BLOWFISH,CRYPT_EXT_DES,CRYPT_MD5,CRYPT_SALT_LENGTH,CRYPT_STD_DES,CURRENCY_SYMBOL,DAY_1,DAY_2,DAY_3,DAY_4,DAY_5,DAY_6,DAY_7,DECIMAL_POINT,DEFAULT_INCLUDE_PATH,DIRECTORY_SEPARATOR,D_FMT,D_T_FMT,ENT_COMPAT,ENT_NOQUOTES,ENT_QUOTES,ERA,ERA_D_FMT,ERA_D_T_FMT,ERA_T_FMT,ERA_YEAR,EXTR_IF_EXISTS,EXTR_OVERWRITE,EXTR_PREFIX_ALL,EXTR_PREFIX_IF_EXISTS,EXTR_PREFIX_INVALID,EXTR_PREFIX_SAME,EXTR_SKIP,E_ALL,E_COMPILE_ERROR,E_COMPILE_WARNING,E_CORE_ERROR,E_CORE_WARNING,E_ERROR,E_NOTICE,E_PARSE,E_STRICT,E_USER_ERROR,E_USER_NOTICE,E_USER_WARNING,E_WARNING,FRAC_DIGITS,GROUPING,HTML_ENTITIES,HTML_SPECIALCHARS,INFO_ALL,INFO_CONFIGURATION,INFO_CREDITS,INFO_ENVIRONMENT,INFO_GENERAL,INFO_LICENSE,INFO_MODULES,INFO_VARIABLES,INI_ALL,INI_PERDIR,INI_SYSTEM,INI_USER,INT_CURR_SYMBOL,INT_FRAC_DIGITS,LC_ALL,LC_COLLATE,LC_CTYPE,LC_MESSAGES,LC_MONETARY,LC_NUMERIC,LC_TIME,LOCK_EX,LOCK_NB,LOCK_SH,LOCK_UN,LOG_ALERT,LOG_AUTH,LOG_AUTHPRIV,LOG_CONS,LOG_CRIT,LOG_CRON,LOG_DAEMON,LOG_DEBUG,LOG_EMERG,LOG_ERR,LOG_INFO,LOG_KERN,LOG_LOCAL0,LOG_LOCAL1,LOG_LOCAL2,LOG_LOCAL3,LOG_LOCAL4,LOG_LOCAL5,LOG_LOCAL6,LOG_LOCAL7,LOG_LPR,LOG_MAIL,LOG_NDELAY,LOG_NEWS,LOG_NOTICE,LOG_NOWAIT,LOG_ODELAY,LOG_PERROR,LOG_PID,LOG_SYSLOG,LOG_USER,LOG_UUCP,LOG_WARNING,MON_1,MON_10,MON_11,MON_12,MON_2,MON_3,MON_4,MON_5,MON_6,MON_7,MON_8,MON_9,MON_DECIMAL_POINT,MON_GROUPING,MON_THOUSANDS_SEP,M_1_PI,M_2_PI,M_2_SQRTPI,M_E,M_LN10,M_LN2,M_LOG10E,M_LOG2E,M_PI,M_PI_2,M_PI_4,M_SQRT1_2,M_SQRT2,NEGATIVE_SIGN,NOEXPR,NOSTR,N_CS_PRECEDES,N_SEP_BY_SPACE,N_SIGN_POSN,PATHINFO_BASENAME,PATHINFO_DIRNAME,PATHINFO_EXTENSION,PATH_SEPARATOR,PEAR_EXTENSION_DIR,PEAR_INSTALL_DIR,PHP_BINDIR,PHP_CONFIG_FILE_PATH,PHP_CONFIG_FILE_SCAN_DIR,PHP_DATADIR,PHP_EOL,PHP_EXTENSION_DIR,PHP_INT_MAX,PHP_INT_SIZE,PHP_LIBDIR,PHP_LOCALSTATEDIR,PHP_OS,PHP_OUTPUT_HANDLER_CONT,PHP_OUTPUT_HANDLER_END,PHP_OUTPUT_HANDLER_START,PHP_PREFIX,PHP_SAPI,PHP_SHLIB_SUFFIX,PHP_SYSCONFDIR,PHP_VERSION,PM_STR,POSITIVE_SIGN,P_CS_PRECEDES,P_SEP_BY_SPACE,P_SIGN_POSN,RADIXCHAR,SEEK_CUR,SEEK_END,SEEK_SET,SORT_ASC,SORT_DESC,SORT_NUMERIC,SORT_REGULAR,SORT_STRING,STR_PAD_BOTH,STR_PAD_LEFT,STR_PAD_RIGHT,THOUSANDS_SEP,THOUSEP,T_FMT,T_FMT_AMPM,YESEXPR,YESSTR,__COMPILER_HALT_OFFSET__");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("array_change_key_case,array_chunk,array_combine,array_count_values,array_diff_assoc,array_diff_key,array_diff_uassoc,array_diff_ukey,array_diff,array_fill,array_filter,array_flip,array_intersect_assoc,array_intersect_key,array_intersect_uassoc,array_intersect_ukey,array_intersect,array_key_exists,array_keys,array_map,array_merge_recursive,array_merge,array_multisort,array_pad,array_pop,array_product,array_push,array_rand,array_reduce,array_reverse,array_search,array_shift,array_slice,array_splice,array_sum,array_udiff_assoc,array_udiff_uassoc,array_udiff,array_uintersect_assoc,array_uintersect_uassoc,array_uintersect,array_unique,array_unshift,array_values,array_walk_recursive,array_walk,array,arsort,asort,compact,count,current,each,end,extract,in_array,key,krsort,ksort,list,natcasesort,natsort,next,pos,prev,range,reset,rsort,shuffle,sizeof,sort,uasort,uksort,usort,call_user_method_array,call_user_method,class_exists,get_class_methods,get_class_vars,get_class,get_declared_classes,get_declared_interfaces,get_object_vars,get_parent_class,interface_exists,is_a,is_subclass_of,method_exists,property_exists,COM,DOTNET,VARIANT,com_addref,com_create_guid,com_event_sink,com_get_active_object,com_get,com_invoke,com_isenum,com_load_typelib,com_load,com_message_pump,com_print_typeinfo,com_propget,com_propput,com_propset,com_release,com_set,variant_abs,variant_add,variant_and,variant_cast,variant_cat,variant_cmp,variant_date_from_timestamp,variant_date_to_timestamp,variant_div,variant_eqv,variant_fix,variant_get_type,variant_idiv,variant_imp,variant_int,variant_mod,variant_mul,variant_neg,variant_not,variant_or,variant_pow,variant_round,variant_set_type,variant_set,variant_sub,variant_xor,ctype_alnum,ctype_alpha,ctype_cntrl,ctype_digit,ctype_graph,ctype_lower,ctype_print,ctype_punct,ctype_space,ctype_upper,ctype_xdigit,checkdate,date_default_timezone_get,date_default_timezone_set,date_sunrise,date_sunset,date,getdate,gettimeofday,gmdate,gmmktime,gmstrftime,idate,localtime,microtime,mktime,strftime,strptime,strtotime,time,chdir,chroot,dir,closedir,getcwd,opendir,readdir,rewinddir,scandir,dom_import_simplexml,DOMAttr,DOMCharacterData,DOMComment,DOMDocument,DOMElement,DOMEntityReference,DOMImplementation,DOMNamedNodeMap,DOMNode,DOMNodelist,DOMProcessingInstruction,DOMText,DOMXPath,debug_backtrace,debug_print_backtrace,error_log,error_reporting,restore_error_handler,restore_exception_handler,set_error_handler,set_exception_handler,trigger_error,user_error,basename,chgrp,chmod,chown,clearstatcache,copy,delete,dirname,disk_free_space,disk_total_space,diskfreespace,fclose,feof,fflush,fgetc,fgetcsv,fgets,fgetss,file_exists,file_get_contents,file_put_contents,file,fileatime,filectime,filegroup,fileinode,filemtime,fileowner,fileperms,filesize,filetype,flock,fnmatch,fopen,fpassthru,fputcsv,fputs,fread,fscanf,fseek,fstat,ftell,ftruncate,fwrite,glob,is_dir,is_executable,is_file,is_link,is_readable,is_uploaded_file,is_writable,is_writeable,link,linkinfo,lstat,mkdir,move_uploaded_file,parse_ini_file,pathinfo,pclose,popen,readfile,readlink,realpath,rename,rewind,rmdir,set_file_buffer,stat,symlink,tempnam,tmpfile,touch,umask,unlink,call_user_func_array,call_user_func,create_function,func_get_arg,func_get_args,func_num_args,function_exists,get_defined_functions,register_shutdown_function,register_tick_function,unregister_tick_function,hash_algos,hash_file,hash_final,hash_hmac_file,hash_hmac,hash_init,hash_update_file,hash_update_stream,hash_update,hash,header,headers_list,headers_sent,setcookie,setrawcookie,iis_add_server,iis_get_dir_security,iis_get_script_map,iis_get_server_by_comment,iis_get_server_by_path,iis_get_server_rights,iis_get_service_state,iis_remove_server,iis_set_app_settings,iis_set_dir_security,iis_set_script_map,iis_set_server_rights,iis_start_server,iis_start_service,iis_stop_server,iis_stop_service,abs,acos,acosh,asin,asinh,atan2,atan,atanh,base_convert,bindec,ceil,cos,cosh,decbin,dechex,decoct,deg2rad,exp,expm1,floor,fmod,getrandmax,hexdec,hypot,is_finite,is_infinite,is_nan,lcg_value,log10,log1p,log,max,min,mt_getrandmax,mt_rand,mt_srand,octdec,pi,pow,rad2deg,rand,round,sin,sinh,sqrt,srand,tan,tanh,connection_aborted,connection_status,connection_timeout,constant,define,defined,die,eval,exit,get_browser,__halt_compiler,highlight_file,highlight_string,ignore_user_abort,pack,php_check_syntax,php_strip_whitespace,show_source,sleep,sys_getloadavg,time_nanosleep,time_sleep_until,uniqid,unpack,usleep,checkdnsrr,closelog,debugger_off,debugger_on,define_syslog_variables,dns_check_record,dns_get_mx,dns_get_record,fsockopen,gethostbyaddr,gethostbyname,gethostbynamel,getmxrr,getprotobyname,getprotobynumber,getservbyname,getservbyport,inet_ntop,inet_pton,ip2long,long2ip,openlog,pfsockopen,socket_get_status,socket_set_blocking,socket_set_timeout,syslog,nsapi_request_headers,nsapi_response_headers,nsapi_virtual,flush,ob_clean,ob_end_clean,ob_end_flush,ob_flush,ob_get_clean,ob_get_contents,ob_get_flush,ob_get_length,ob_get_level,ob_get_status,ob_gzhandler,ob_implicit_flush,ob_list_handlers,ob_start,output_add_rewrite_var,output_reset_rewrite_vars,Pattern Modifiers,Pattern Syntax,preg_grep,preg_match_all,preg_match,preg_quote,preg_replace_callback,preg_replace,preg_split,assert_options,assert,dl,extension_loaded,get_cfg_var,get_current_user,get_defined_constants,get_extension_funcs,get_include_path,get_included_files,get_loaded_extensions,get_magic_quotes_gpc,get_magic_quotes_runtime,get_required_files,getenv,getlastmod,getmygid,getmyinode,getmypid,getmyuid,getopt,getrusage,ini_alter,ini_get_all,ini_get,ini_restore,ini_set,main,memory_get_usage,php_ini_scanned_files,php_logo_guid,php_sapi_name,php_uname,phpcredits,phpinfo,phpversion,putenv,restore_include_path,set_include_path,set_magic_quotes_runtime,set_time_limit,version_compare,zend_logo_guid,zend_version,posix_access,posix_ctermid,posix_get_last_error,posix_getcwd,posix_getegid,posix_geteuid,posix_getgid,posix_getgrgid,posix_getgrnam,posix_getgroups,posix_getlogin,posix_getpgid,posix_getpgrp,posix_getpid,posix_getppid,posix_getpwnam,posix_getpwuid,posix_getrlimit,posix_getsid,posix_getuid,posix_isatty,posix_kill,posix_mkfifo,posix_mknod,posix_setegid,posix_seteuid,posix_setgid,posix_setpgid,posix_setsid,posix_setuid,posix_strerror,posix_times,posix_ttyname,posix_uname,escapeshellarg,escapeshellcmd,exec,passthru,proc_close,proc_get_status,proc_nice,proc_open,proc_terminate,shell_exec,system,session_cache_expire,session_cache_limiter,session_commit,session_decode,session_destroy,session_encode,session_get_cookie_params,session_id,session_is_registered,session_module_name,session_name,session_regenerate_id,session_register,session_save_path,session_set_cookie_params,session_set_save_handler,session_start,session_unregister,session_unset,session_write_close,simplexml_import_dom,simplexml_load_file,simplexml_load_string,SimpleXMLElement,ArrayIterator,ArrayObject,CachingIterator,CachingRecursiveIterator,class_implements,class_parents,DirectoryIterator,FilterIterator,iterator_count,iterator_to_array,LimitIterator,ParentIterator,RecursiveDirectoryIterator,RecursiveIteratorIterator,SimpleXMLIterator,spl_classes,stream_bucket_append,stream_bucket_make_writeable,stream_bucket_new,stream_bucket_prepend,stream_context_create,stream_context_get_default,stream_context_get_options,stream_context_set_option,stream_context_set_params,stream_copy_to_stream,stream_filter_append,stream_filter_prepend,stream_filter_register,stream_filter_remove,stream_get_contents,stream_get_filters,stream_get_line,stream_get_meta_data,stream_get_transports,stream_get_wrappers,stream_register_wrapper,stream_select,stream_set_blocking,stream_set_timeout,stream_set_write_buffer,stream_socket_accept,stream_socket_client,stream_socket_enable_crypto,stream_socket_get_name,stream_socket_pair,stream_socket_recvfrom,stream_socket_sendto,stream_socket_server,stream_wrapper_register,stream_wrapper_restore,stream_wrapper_unregister,addcslashes,addslashes,bin2hex,chop,chr,chunk_split,convert_cyr_string,convert_uudecode,convert_uuencode,count_chars,crc32,crypt,echo,explode,fprintf,get_html_translation_table,hebrev,hebrevc,html_entity_decode,htmlentities,htmlspecialchars_decode,htmlspecialchars,implode,join,levenshtein,localeconv,ltrim,md5_file,md5,metaphone,money_format,nl_langinfo,nl2br,number_format,ord,parse_str,print,printf,quoted_printable_decode,quotemeta,rtrim,setlocale,sha1_file,sha1,similar_text,soundex,sprintf,sscanf,str_ireplace,str_pad,str_repeat,str_replace,str_rot13,str_shuffle,str_split,str_word_count,strcasecmp,strchr,strcmp,strcoll,strcspn,strip_tags,stripcslashes,stripos,stripslashes,stristr,strlen,strnatcasecmp,strnatcmp,strncasecmp,strncmp,strpbrk,strpos,strrchr,strrev,strripos,strrpos,strspn,strstr,strtok,strtolower,strtoupper,strtr,substr_compare,substr_count,substr_replace,substr,trim,ucfirst,ucwords,vfprintf,vprintf,vsprintf,wordwrap,token_get_all,token_name,base64_decode,base64_encode,get_headers,get_meta_tags,http_build_query,parse_url,rawurldecode,rawurlencode,urldecode,urlencode,debug_zval_dump,doubleval,empty,floatval,get_defined_vars,get_resource_type,gettype,import_request_variables,intval,is_array,is_bool,is_callable,is_double,is_float,is_int,is_integer,is_long,is_null,is_numeric,is_object,is_real,is_resource,is_scalar,is_string,isset,print_r,serialize,settype,strval,unserialize,unset,var_dump,var_export,w32api_deftype,w32api_init_dtype,w32api_invoke_function,w32api_register_function,w32api_set_call_method,utf8_decode,utf8_encode,xml_error_string,xml_get_current_byte_index,xml_get_current_column_number,xml_get_current_line_number,xml_get_error_code,xml_parse_into_struct,xml_parse,xml_parser_create_ns,xml_parser_create,xml_parser_free,xml_parser_get_option,xml_parser_set_option,xml_set_character_data_handler,xml_set_default_handler,xml_set_element_handler,xml_set_end_namespace_decl_handler,xml_set_external_entity_ref_handler,xml_set_notation_decl_handler,xml_set_object,xml_set_processing_instruction_handler,xml_set_start_namespace_decl_handler,xml_set_unparsed_entity_decl_handler,XMLReader");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("'");
		//行注释字�?
		this._lineComment	= "//,#";
		//转义字符
		this._escape		= "";
		//多行引用开�?
		this._commentOn		= "/*";
		//多行引用结束
		this._commentOff	= "*/";
		//忽略�?
		this._ignore		= "";
		//是否处理标记
		this._dealTag		= false;

		/**/
		break;
		case "c#":
		//是否大小写敏�?
		this._caseSensitive	= true;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("abstract,as,base,bool,break,byte,case,catch,char,checked,class,const,continue,decimal,default,delegate,do,double,else,enum,event,explicit,extern,false,finally,fixed,float,for,foreach,get,goto,if,implicit,in,int,interface,internal,is,lock,long,namespace,new,null,object,operator,out,override,params,private,protected,public,readonly,ref,return,sbyte,sealed,short,sizeof,stackalloc,static,set,string,struct,switch,this,throw,true,try,typeof,uint,ulong,unchecked,unsafe,ushort,using,value,virtual,void,volatile,while");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("String,Boolean,DateTime,Int32,Int64,Exception,DataTable,DataReader");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("\"");
		//行注释字�?
		this._lineComment	= "//";
		//转义字符
		this._escape		= "\\";
		//多行引用开�?
		this._commentOn		= "/*";
		//多行引用结束
		this._commentOff	= "*/";
		//忽略�?
		this._ignore		= "";
		//是否处理标记
		this._dealTag		= false;
		break;
		case "java":
		//是否大小写敏�?
		this._caseSensitive	= true;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("abstract,boolean,break,byte,case,catch,char,class,const,continue,default,do,double,else,extends,final,finally,float,for,goto,if,implements,import,instanceof,int,interface,long,native,new,package,private,protected,public,return,short,static,strictfp,super,switch,synchronized,this,throw,throws,transient,try,void,volatile,while");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("String,Boolean,DateTime,Int32,Int64,Exception,DataTable,DataReader");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("\"");
		//行注释字�?
		this._lineComment	= "//";
		//转义字符
		this._escape		= "\\";
		//多行引用开�?
		this._commentOn		= "/*";
		//多行引用结束
		this._commentOff	= "*/";
		//忽略�?
		this._ignore		= "";
		//是否处理标记
		this._dealTag		= false;
		break;
		case "vbs":
		case "vb":
		//是否大小写敏�?
		this._caseSensitive	= false;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("And,ByRef,ByVal,Call,Case,Class,Const,Dim,Do,Each,Else,ElseIf,Empty,End,Eqv,Erase,Error,Exit,Explicit,False,For,Function,Get,If,Imp,In,Is,Let,Loop,Mod,Next,Not,Nothing,Null,On,Option,Or,Private,Property,Public,Randomize,ReDim,Resume,Select,Set,Step,Sub,Then,To,True,Until,Wend,While,Xor,Anchor,Array,Asc,Atn,CBool,CByte,CCur,CDate,CDbl,Chr,CInt,CLng,Cos,CreateObject,CSng,CStr,Date,DateAdd,DateDiff,DatePart,DateSerial,DateValue,Day,Dictionary,Document,Element,Err,Exp,FileSystemObject,Filter,Fix,Int,Form,FormatCurrency,FormatDateTime,FormatNumber,FormatPercent,GetObject,Hex,Hour,InputBox,InStr,InstrRev,IsArray,IsDate,IsEmpty,IsNull,IsNumeric,IsObject,Join,LBound,LCase,Left,Len,Link,LoadPicture,Location,Log,LTrim,RTrim,Trim,Mid,Minute,Month,MonthName,MsgBox,Navigator,Now,Oct,Replace,Right,Rnd,Round,ScriptEngine,ScriptEngineBuildVersion,ScriptEngineMajorVersion,ScriptEngineMinorVersion,Second,Sgn,Sin,Space,Split,Sqr,StrComp,String,StrReverse,Tan,Time,TextStream,TimeSerial,TimeValue,TypeName,UBound,UCase,VarType,Weekday,WeekDayName,Year");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("String,Number,Boolean,Date,Integert,Long,Double,Single");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("\"");
		//行注释字�?
		this._lineComment	= "'";
		//转义字符
		this._escape		= "";
		//多行引用开�?
		this._commentOn		= "";
		//多行引用结束
		this._commentOff	= "";
		//忽略�?
		this._ignore		= "<!--";
		//是否处理标记
		this._dealTag		= false;
		break;
		case "js":
		//是否大小写敏�?
		this._caseSensitive	= true;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("function,void,this,boolean,while,if,return,new,true,false,try,catch,throw,null,else,int,long,do,var");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("String,Number,Boolean,RegExp,Error,Math,Date");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("\",'");
		//行注释字�?
		this._lineComment	= "//";
		//转义字符
		this._escape		= "\\";
		//多行引用开�?
		this._commentOn		= "/*";
		//多行引用结束
		this._commentOff	= "*/";
		//忽略�?
		this._ignore		= "<!--";
		break;
		case "html":
		//是否大小写敏�?
		this._caseSensitive	= true;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("function,void,this,boolean,while,if,return,new,true,false,try,catch,throw,null,else,int,long,do,var");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("String,Number,Boolean,RegExp,Error,Math,Date");
		//标记
		this._tags			= this.str2hashtable("html,head,body,title,style,script,language,input,select,div,span,button,img,iframe,frame,frameset,table,tr,td,caption,form,font,meta,textarea",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.?!;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("\",'");
		//行注释字�?
		this._lineComment	= "//";
		//转义字符
		this._escape		= "\\";
		//多行引用开�?
		this._commentOn		= "/*";
		//多行引用结束
		this._commentOff	= "*/";
		//忽略�?
		this._ignore		= "<!--";
		//是否处理标记
		this._dealTag		= true;
		break;
		case "xml":
		default:
		//是否大小写敏�?
		this._caseSensitive	= true;
		//得到关键字哈希表
		this._keywords		= this.str2hashtable("!DOCTYPE,?xml,script,version,encoding");
		//得到内建对象哈希�?
		this._commonObjects = this.str2hashtable("");
		//标记
		this._tags			= this.str2hashtable("",false);
		//得到分割字符
		this._wordDelimiters= "　 ,.;:\\/<>(){}[]\"'\r\n\t=+-|*%@#$^&";
		//引用字符
		this._quotation		= this.str2hashtable("\",'");
		//行注释字�?
		this._lineComment	= "";
		//转义字符
		this._escape		= "\\";
		//多行引用开�?
		this._commentOn		= "<!--";
		//多行引用结束
		this._commentOff	= "-->";
		//忽略�?
		this._ignore		= "<!--";
		//是否处理标记
		this._dealTag		= true;
		break;
	}

	this.highlight	= function() {
		var codeArr = new Array();
		var word_index = 0;
		var htmlTxt = new Array();

		//得到分割字符数组(分词)
		for (var i = 0; i < this._codetxt.length; i++) {
			if (this._wordDelimiters.indexOf(this._codetxt.charAt(i)) == -1) {		//找不到关键字
				if (codeArr[word_index] == null || typeof(codeArr[word_index]) == 'undefined') {
					codeArr[word_index] = "";
				}
				codeArr[word_index] += this._codetxt.charAt(i);
			} else {
				if (typeof(codeArr[word_index]) != 'undefined' && codeArr[word_index].length > 0)
				word_index++;
				codeArr[word_index++] = this._codetxt.charAt(i);
			}
		}

		var quote_opened				= false;	//引用标记
		var slash_star_comment_opened	= false;	//多行注释标记
		var slash_slash_comment_opened	= false;	//单行注释标记
		var line_num					= 1;		//行号
		var quote_char					= "";		//引用标记类型
		var tag_opened					= false;	//标记开�?

		htmlTxt[htmlTxt.length] = ("<div style='font-family: Courier New;font-size:12px;overflow:auto;margin:1px;padding:6px;color:#333333'>");

		//按分割字，分块显�?
		for (var i=0; i <=word_index; i++){

			//处理空行（由于转义带来）
			if(typeof(codeArr[i])=="undefined"||codeArr[i].length==0){
				continue;
			}
			//处理空格
			if (codeArr[i] == " "){
				htmlTxt[htmlTxt.length] = ("&nbsp;");
				//处理关键�?
			} else if (!slash_slash_comment_opened&&!slash_star_comment_opened && !quote_opened && this.isKeyword(codeArr[i])){
				htmlTxt[htmlTxt.length] = ("<span style='color:#0000FF;'>" + codeArr[i] + "</span>");
				//处理普通对�?
			} else if (!slash_slash_comment_opened&&!slash_star_comment_opened && !quote_opened && this.isCommonObject(codeArr[i])){
				htmlTxt[htmlTxt.length] = ("<span style='color:#808000;'>" + codeArr[i] + "</span>");
				//处理标记
			} else if (!slash_slash_comment_opened&&!slash_star_comment_opened && !quote_opened && tag_opened && this.isTag(codeArr[i])){
				htmlTxt[htmlTxt.length] = ("<span style='color:#0000FF;'>" + codeArr[i] + "</span>");
				//处理换行
			} else if (codeArr[i] == "\r" || codeArr[i] == "\n" && codeArr[i-1] != "\r"){
				if (slash_slash_comment_opened){
					htmlTxt[htmlTxt.length] = ("</span>");
					slash_slash_comment_opened = false;
				}
				htmlTxt[htmlTxt.length] = ("<br/>");
				line_num++;
				//处理双引号（引号前不能为转义字符�?
			} else if (this._quotation.contains(codeArr[i])&&!slash_star_comment_opened&&!slash_slash_comment_opened){
				if (quote_opened){
					//是相应的引号
					if (quote_char==codeArr[i]){
						if(tag_opened){
							htmlTxt[htmlTxt.length] = (codeArr[i]+"</span><span style='color:#808000;'>");
						} else {
							htmlTxt[htmlTxt.length] = (codeArr[i]+"</span>");
						}
						quote_opened	= false;
						quote_char		= "";
					} else {
						htmlTxt[htmlTxt.length] = codeArr[i].replace(/\</g,"&lt;");
					}
				} else {
					if (tag_opened){
						htmlTxt[htmlTxt.length] =  ("</span><span style='color:#FF00FF;'>"+codeArr[i]);
					} else {
						htmlTxt[htmlTxt.length] =  ("<span style='color:#FF00FF;'>"+codeArr[i]);
					}
					quote_opened	= true;
					quote_char		= codeArr[i];
				}
				//处理转义字符
			} else if(codeArr[i] == this._escape){
				htmlTxt[htmlTxt.length] = (codeArr[i]);
				if (i<word_index){
					if (codeArr[i+1].charCodeAt(0)>=32&&codeArr[i+1].charCodeAt(0)<=127){
						htmlTxt[htmlTxt.length] = codeArr[i+1].substr(0,1);
						codeArr[i+1] = codeArr[i+1].substr(1);
					}
				}
				//处理Tab
			} else if (codeArr[i] == "\t") {
				htmlTxt[htmlTxt.length] = ("&nbsp;&nbsp;");
				//处理多行注释的开�?
			} else if (this.isStartWith(this._commentOn,codeArr,i)&&!slash_slash_comment_opened && !slash_star_comment_opened&&!quote_opened){
				slash_star_comment_opened = true;
				htmlTxt[htmlTxt.length] =  ("<span style='color:#008000;'>" + this._commentOn.replace(/\</g,"&lt"));
				i = i + this._commentOn.length-1;
				//处理单行注释
			} else if (this.isStartWith(this._lineComment,codeArr,i)&&!slash_slash_comment_opened && !slash_star_comment_opened&&!quote_opened){
				slash_slash_comment_opened = true;
				htmlTxt[htmlTxt.length] =  ("<span style='color:#008000;'>" + this._lineComment);
				i = i + this._lineComment.length-1;
				//处理忽略�?
			} else if (this.isStartWith(this._ignore,codeArr,i)&&!slash_slash_comment_opened && !slash_star_comment_opened&&!quote_opened){
				slash_slash_comment_opened = true;
				htmlTxt[htmlTxt.length] =  ("<span style='color:#008000;'>" + this._ignore.replace(/\</g,"&lt"));
				i = i + this._ignore.length-1;
				//处理多行注释结束
			} else if (this.isStartWith(this._commentOff,codeArr,i)&&!quote_opened&&!slash_slash_comment_opened){
				if (slash_star_comment_opened) {
					slash_star_comment_opened = false;
					htmlTxt[htmlTxt.length] =  (this._commentOff +"</span>");
					i = i + this._commentOff.length-1;
				}
				//处理左标�?
			} else if (this._dealTag&&!slash_slash_comment_opened && !slash_star_comment_opened&&!quote_opened&&codeArr[i] == "<") {
				htmlTxt[htmlTxt.length] = "&lt;<span style='color:#808000;'>";
				tag_opened	= true;
				//处理右标�?
			} else if (this._dealTag&&tag_opened&&codeArr[i] == ">") {
				htmlTxt[htmlTxt.length] = "</span>&gt;";
				tag_opened	= false;
				//处理HTML转义符号
			} else if (codeArr[i] == "&") {
				htmlTxt[htmlTxt.length] = "&amp;";
			} else {
				htmlTxt[htmlTxt.length] = codeArr[i].replace(/\</g,"&lt;");
			}
		}
		htmlTxt[htmlTxt.length] = ("</div>");

		return htmlTxt.join("");
	}

	this.isStartWith = function(str,code,index){
		if(typeof(str)!="undefined"&&str.length>0){
			for(var i=0;i<str.length;i++){
				if(this._caseSensitive){
					if(str.charAt(i)!=code[index+i]||(index+i>=code.length)){
						return false;
					}
				} else {
					if(str.charAt(i).toLowerCase()!=code[index+i].toLowerCase()||(index+i>=code.length)){
						return false;
					}
				}
			}
			return true;
		} else {
			return false;
		}
	}

	this.isKeyword = function(val){
		return this._keywords.contains(this._caseSensitive?val:val.toLowerCase());
	}

	this.isCommonObject = function(val){
		return this._commonObjects.contains(this._caseSensitive?val:val.toLowerCase());
	}

	this.isTag = function(val){
		return this._tags.contains(val.toLowerCase());
	}

}

function doHighlight(o, syntax){
	var htmltxt = "";

	if(o == null){
		alert("domNode is null!");
		return;
	}

	var _codetxt = "";

	if(typeof(o)=="object"){
		switch(o.tagName){
			case "TEXTAREA":
			case "INPUT":
			_codetxt = o.value;
			break;
			case "DIV":
			case "SPAN":
			_codetxt = o.innerText;
			break;
			default:
			_codetxt = o.innerHTML;
			break;
		}
	}else{
		_codetxt = o;
	}

	var _syn = new CLASS_HIGHLIGHT(_codetxt,syntax);

	htmltxt = _syn.highlight();

	return  htmltxt;
}

function plaster(){
	if(document.all){
		document.form1.m.focus()
		document.execCommand("Paste")
	}else{
		alert('因为Firefox的安全机制限制，请您手动粘贴�?');
	}
}

function goit(stx){
	var code = document.getElementById("m").value;
	var _class = new CLASS_HIGHLIGHT(code,stx);
	document.getElementById("highlight").innerHTML = _class.highlight();
}


