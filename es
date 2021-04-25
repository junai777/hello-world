ElasticSearch学习笔记

- 文档：索引和搜索数据的最小单位：同时包含字段和取值（类似关系型数据库中的行）
- 类型：是文档的逻辑容器，如表格是行的容器（类似关系型数据库中的表）
- 索引：是映射类型的容器（类似关系型数据库中的数据库）



通过curl命令的简单索引语句

% curl  -XPUT 'localhost : 9200/get-together/group/1?pretty' -d '{

​	"name" : "ElasticSearch Denver",

​	"organizer" : "Lee"

}'

获得输出

{

​	"_index" : "get-together",

​	"_type" : "group",

​	"_id" : "1",

​	"_version" : 1,

​	"created" : true

}

创建索引

% curl  -XPUT 'localhost : 9200/new-index'

获取映射

% curl   'localhost : 9200/get-together/_mapping/group?pretty'



在哪搜索

%curl 'localhost:9200/索引一个或多个/类型零到多个/_search'



定义新的映射

%curl -XPUT 'localhost:9200/get-together/_mapping/new-events'{

"new-events": {

​	"properties":{

​			"host":{

​						"type":"string"

​						}

​			}

​	}

}



定义对象数据类型映射

{
  "mappings": {
    "properties": { 
      "region": {
        "type": "keyword"
      },
      "manager": { 
        "properties": {
          "age":  { "type": "integer" },
          "name": { 
            "properties": {
              "first": { "type": "text" },
              "last":  { "type": "text" }
            }
          }
        }
      }
    }
  }
}



扩展现有的映射

直接添加，但不能更改现有的映射，除非删除数据和移除映射再重新映射



字段的类型：

1.字符串：keyword(不可分析), text(可分析)

2.数值类型：byte, short, int, long

3.日期类型：可用format定制化日期格式

4.布尔类型：true, false



通过version进行并发控制(乐观锁)



删除单个文档：%curl 'localhost:9200/online-shop/shirts/1'

删除映射类型：%curl 'localhost:9200/online-shop/shirts'

删除索引: %curl 'localhost:9200/get-together'

更新：%curl -XPOST 'localhost:9200/get-together/group/2/_update'

{	

​	"doc":{"organizer":"Roy"},

​	"upsert":{

​		"name":"elasticsearch denver",

​		"organizer":"Roy"

​	}

}





搜索数据

URL方式

限制source的字段：

curl 'localhost:9200/get-together/_search?sort=date:asc&source=title,date'

匹配title字段中含有elasticsearch：

curl 'localhost:9200/get-together/_search?sort=date:asc&q=title:elasticsearch'

索引一切：

% curl 'localhost:9200/get-together/group/_search?q=elasticsearch'



JSON方式

索引一切：

% curl 'localhost:9200/get-together/group/_search

{

​	"query":{

​		"match_all":{}

​	},

}

排序和限制返回

% curl 'localhost:9200/get-together/group/_search

{
	"query":{
		"match_all":{}
	},
	"sort":{"publish_date":"desc"},
	"_source":{"include":["publish_content"]}
}

match查询

% curl 'localhost:9200/get-together/group/_search

{
	"query":{
		"match":{"spider_key":"苹果"}
	}
}

term查询(一个值对一个字段)

% curl 'localhost:9200/get-together/group/_search

{
	"query":{
		"term":{
			"publish_date": "2018-11-15"
		}
	}
}

terms查询(多值对一个字段)

% curl 'localhost:9200/get-together/group/_search

{
	"query":{
		"terms":{
			"publish_date": ["2018-11-15","2018-11-10"]
		}
	}
}

multi_match查询(一个值对多个字段)

% curl 'localhost:9200/get-together/group/_search

{
	"query":{
		"multi_match":{
			"query":"IQOO",
			"fields":["product_id","publish_content"]
		}
	}
}

bool查询

% curl '172.25.103.142:9200/vivo_latest/_search'

{
	"query":{
		"bool":{
			"must":[
				{
					"term":{
						"score": 0
					}
				}
			],
			"should":[{
				"term":{
					"author_score":0
				}
			},
			{
				"term":{
					"spider_date":"2018-11-19"
				}	
			}
			],
			"must_not":[{
				"range":{
					"publish_date":{
						"gte":"2018-11-10"
					}
				}
			}],
			"minimum_should_match":1
		}
	}
}

bool查询带filter

{
	"query":{
		"bool":{
			"must":[
				{
					"term":{
						"score": 0
					}
				}
			],
			"should":[{
				"term":{
					"author_score":0
				}
			},
			{
				"term":{
					"spider_date":"2018-11-19"
				}	
			}
			],
			"must_not":[{
				"range":{
					"publish_date":{
						"gte":"2018-11-10"
					}
				}
			}],
			"filter":{
				"term":{
					"reply_cnt": "1"
				}
			}
		}
	}
}

range查询和过滤器

% curl 'localhost:9200/get-together/group/_search

{

​	"query":{

​		"range":{

​			"created_on":{

​				"gt":"2018-01-09",

​				"lt":"2019-01-09"

​			}

​		}

​	}

}



聚集分为度量型聚集和桶型聚集

前者指一组文档的统计分析，可以得到如最大值，最小值，平均值等度量值。

后者将匹配的文档切分为一个或多个桶，然后告诉你每个桶里的文档数量。



1.1聚集的基本结构

%curl 'http://172.25.103.142:9200/vivo_latest/_search'

{
	"aggs":{
		"top_tags":{
			"terms":{
				"field":"spider_date"
			}
		}
	}
}



1.2查询结果结合聚集

{
	"query":{
		"match":{
			"spider_key": "苹果"
		}
	},
	"aggs":{
		"top_tags":{
			"terms":{
				"field":"spider_date"
			}
		}
	}
}



2.度量型聚集

2.1基本指标聚集(如计数,最大最小值,平均值,总和)

{
    "aggs" : {
        "grades_stats" : { 
        	"stats" : 
        	{ 
        		"field" : "author_score" 
        	}
        }
    }
}

2.2高级指标聚集(加上如字段平方值之和,方差,标准差)

{
    "aggs" : {
        "grades_stats" : { 
        	"extended_stats" : 
        	{ 
        		"field" : "author_score" 
        	}
        }
    }
}

2.3近似统计百分位(表示数据在大于1%和小于99%的所有数据时应取的值,常用来筛选异常值)

{
    "aggs" : {
        "author_score_percentiles" : { 
        	"percentiles" : 
        	{ 
        		"field" : "author_score",
        		"percents":[1, 99]
        	}
        }
    }
}

2.4近似统计基数(获得集合的元素个数)

{
    "aggs" : {
        "type_count" : {
            "cardinality" : {
                "field" : "publish_date"
            }
        }
    }
}



3.桶型聚集

3.1. terms聚集

{
    "aggs" : {
        "tags" : {
            "terms":{
            	"field":"publish_date",
            	"order":{
            		"_term":"asc"
            	}
            }
        }
    }
}





size: 返回桶的数量

shard_size: 分片计算的数量

doc_count_error_upper_bound: 错误返回的上限

sum_other_doc_count: 未能排名靠前的词条的总数量

3.1. terms聚集(只为字段值中含有'N'的返回聚集)

{
    "aggs" : {
        "tags" : {
            "terms":{
            	"field":"data_source_id",
            	"include":".*N.*",
            	"order":{
            		"_term":"asc"
            	}
            }
        }
    }
}



3.2. significant_terms聚集()

{
	"query":{
		"match":{
			"data_source_type": "NEWS"
		}
	},
    "aggs" : {
        "tags" : {
            "terms": {
            	"field": "publish_date"
            }
        }
    }
}



3.3. range聚集(对范围进行计数)

{
    "aggs" : {
        "author_score_range" : {
        	"range":{
	        	"field":"author_score",
	            "ranges": [
	            	{"to":4},
	            	{"from":4,"to":10},
	            	{"from":10}
	            	]
        	}
        }
    }
}



3.4. date_range聚集(对时间范围进行计数)

{
    "aggs" : {
        "publish_date_range" : {
        	"date_range":{
	        	"field":"publish_date",
	            "ranges": [
	            	{"from":"2019-01-01"},
	            	{"from":"2018-01-01","to":"2019-01-01"},
	            	{"from":"2017-01-01","to":"2018-01-01"}
	            	]
        	}
        }
    }
}



3.5. histogram聚集(直方图聚集)

{
    "aggs" : {
        "author_score_histogram" : {
        	"histogram":{
	        	"field":"author_score",
	            "interval":10
        	}
        }
    }
}



3.6. date_histogram聚集(日期直方图聚集)

{
    "aggs" : {
        "publish_date_histogram" : {
        	"date_histogram":{
	        	"field":"publish_date",
	            "calendar_interval": "month"
        	}
        }
    }
}



3.7. 嵌套多桶聚集

{
    "aggs" : {
        "tags" : {
            "terms":{
            	"field":"data_source_id",
            	"include":".*N.*",
            	"order":{
            		"_term":"asc"
            	}
            },
            "aggs":{
            	 "publish_date_histogram" : {
		        	"date_histogram":{
			        	"field":"publish_date",
			            "calendar_interval": "month"
        			}	
        		}
            }
        }
    }
}



3.8.嵌套多桶聚集(每个imei号发表评论日期的降序)

{
    "aggs" : {
        "tags":{
        	"terms":{
        		"field":"imei"
        	},
	        	"aggs":{
	        		"top_hits_tags" : {
		            	"top_hits":{
		            		"sort":[{
		            			"publish_date":{
		            				"order":"desc"
		            			}
		            		}],
		            		"_source":{
		            			"include":["title","publish_date"]
		            		}
				        }
			       }
	       	}
        }
    }
}



3.9. global聚集

{
	"query":{
		"match":{
			"spider_key":"苹果"
		}
	},
	"aggs":{
		"all_docs":{
			"global":{},
			"aggs":{
				"top_tags":{
					"terms":{
						"field":"imei"
					}
				}
			}
		}
	}
}



3.10. filter聚集

{
	"query":{
		"match":{
			"spider_key":"苹果"
		}
	},
	"aggs":{
		"all_docs":{
			"filter":{
				"range":{
					"publish_date":{
						"gte":"2018-01-01"
					}
				}
			},
			"aggs":{
				"imei_tag":{
					"terms":{
						"field":"data_source_id"
					}
				}
			}
		}
	}
}



* 更改jvm的堆内存，默认只有1g太小，export ES_HEAP_SIZE=2g



* 索引文档：

1.根据文档ID散列选择一个主分片

2.文档被发送到主分片的其他副分片进行索引



* 搜索索引：

基于负载均衡在完整的分片集合中查找，其中分片可以是主分片和副分片



* 索引要使用别名

创建索引 PUT/my_index_v1

设置别名 PUT/my_index_v1/_alias/my_index

用新映射创建索引 PUT/my_index_v2

{
    "mappings": {
        "properties":{
        "vivo_voc_data":{
            "properties": {

​			...................................

​	

从旧索引删除别名，别名指向新索引

POST /_aliases
{
    "actions": [
        { "remove": { "index": "my_index_v1", "alias": "my_index" }},
        { "add":    { "index": "my_index_v2", "alias": "my_index" }}
    ]
}





开启ES：sudo systemctl start elasticsearch.service

关闭ES：sudo systemctl stop elasticsearch.service

开启kibana：sudo systemctl start kibana.service

关闭kibana：sudo systemctl stop kibana.service





设置ES JVM堆大小:

/etc/security/limits.conf:

elasticsearch - nofile 65535
elasticsearch - memlock unlimited

/etc/default/elasticsearch:

ES_HEAP_SIZE=2048m
MAX_OPEN_FILES=65535
MAX_LOCKED_MEMORY=unlimited

/etc/elasticsearch/jvm.options

-Xms4g
-Xmx4g



bootstrap.mlockall=true

此设置为锁住内存



* 多重字段

为了同一字段拥有不同的用途而索引以不同方式索引同一字段，就是多重字段

例如字符串类型可索引成text或keyword，text可用来全文搜索，而keyword可用来排序或聚合

```console
PUT my_index
{
  "mappings": {
    "properties": {
      "city": {
        "type": "text",
        "fields": {
          "raw": { 
            "type":  "keyword"
          }
        }
      }
    }
  }
}
```

为了使用不同的分析器来实现对同一字段进行分析，同样要使用多重字段

```console
PUT my_index
{
  "mappings": {
    "properties": {
      "text": { 
        "type": "text",
        "fields": {
          "english": { 
            "type":     "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}
```



* 对象型数据类型

```js
{
  "region":             "US",
  "manager.age":        30,
  "manager.name.first": "John",
  "manager.name.last":  "Smith"
}
```

对应的映射为

```console
PUT my_index
{
  "mappings": {
    "properties": { 
      "region": {
        "type": "keyword"
      },
      "manager": { 
        "properties": {
          "age":  { "type": "integer" },
          "name": { 
            "properties": {
              "first": { "type": "text" },
              "last":  { "type": "text" }
            }
          }
        }
      }
    }
  }
}
```



* normalizer 

设置为如下

```console
PUT index
{
  "settings": {
    "analysis": {
      "normalizer": {
        "my_normalizer": {
          "type": "custom",
          "char_filter": [],
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "foo": {
        "type": "keyword",
        "normalizer": "my_normalizer"
      }
    }
  }
}
```

优先用于keyword的索引，同样可优先用于match搜索或term搜索



* analyzer





* index API对相同文档进行索引，文档数会增加，但是倒排索引表字段不会增加，只是增加了对文档id的指向



elasticsearch.yml 、jvm.options位置: /etc/elasticsearch





scroll 轮询是一系列的查询，它返回查询后的一系列查询，其参数可在search查询中指定。一般scroll前搭配一个search。

代码逻辑如下：

```
query = client.search({index: , scroll: , body: { size: scroll_size, query:}});
total = query.hits.total;
_scroll_id = query._scroll_id;
let count = scroll_size;
result.push(query.hits.hits._source);
while(count < scroll_size){
	count = count + scroll_size;
	query = client.scroll({
        scroll_id: _scroll_id,
        scroll: });
    if(count>50000){
    	break;
    }
	result.push(query.hits.hits._source);
}
```



client.search的返回默认的数据量为10条，可通过size设置，但不能超过10000条，因为index.max_result_window = 100000。



查看安装的插件(分词器)

http://esip地址/_cat/plugins



nested类型的字段下的字段无法聚合



ES写入优化相关：写入时可设置

```
PUT /_settings

{
    "refresh_interval": -1
}
```

使写入后不立即可检索，以优化性能

设置最大分桶限制

```
 PUT http://10.102.113.21:11401/_cluster/settings
```

```
{
  "persistent": {
    "search.max_buckets": 50000
  }
}
```



-------------------------------按时间过滤并按字段聚合------------------------------

{
    "aggs" : {
        "tags" : {
            "terms":{
            	"field": "view_point_num",
            	"order":{
            		"_term":"asc"
            	}
            }
        }
    },
    "query": {
        "bool": {
            "filter": [
                {
                    "range": {
                        "publish_date": {
                            "gte": "2019-11-19",
                            "lte": "2019-11-19"
                        }
                    }
                }
            ]
        }
    }
}



--------------------------过滤加查询---------------------------------------------

{"query": {
		"bool": {
			"must": [{
				"match_phrase": {
					"data_source_id": {
						"query": "Ejd"
					}
				}
			},
			{
				"range": {
					"publish_date": {
						"gte": "2019-11-01",
						"lte": "2019-11-01"
					}
				}
			}]
		}
	}
}



计算文档总数：http://172.25.25.54:9200/vivo_latest/_count



删除es满足条件的数据

POST	http://10.102.113.152:11401/vivo_voc_crisis/_delete_by_query

{
  "query": {
    "match": {
      "device.standard.name": "unknown"
    }
  }
}



增加映射字段

PUT http://10.102.113.152:11401/vivo_voc_crisis_test_v2/_mapping

```
 {
        "properties": {
            "crisis": {
                "properties": {
                    "importance": {
                        "type": "float"
                    }   
                }
            }
        }
    }

```

```
{
    "properties": {
        "src": {
            "properties": {
                "pictures": {
                    "type": "text",
                    "fielddata": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "my_normalizer",
                            "ignore_above": 256
                        }
                    }
                },
                "subcategory": {
                    "type": "text",
                    "fielddata": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "my_normalizer",
                            "ignore_above": 256
                        }
                    }
                }
            }
        },
        "device": {
            "properties": {
                "spu_id": {
                    "type": "text",
                    "fielddata": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "my_normalizer",
                            "ignore_above": 256
                        }
                    }
                },
                "sku_id": {
                    "type": "text",
                    "fielddata": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "my_normalizer",
                            "ignore_above": 256
                        }
                    }
                },
                "order_id": {
                    "type": "text",
                    "fielddata": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "my_normalizer",
                            "ignore_above": 256
                        }
                    }
                }
            }
        },
        "question": {
            "properties": {
                "match_content": {
                    "type": "text",
                    "fielddata": true,
                    "analyzer": "ik_max_word",
                    "search_analyzer": "ik_smart",
                    "fields": {
                        "raw": {
                            "type": "keyword",
                            "normalizer": "my_normalizer",
                            "ignore_above": 256
                        }
                    }
                }
            }
        }
    }
}
```

curl增加映射字段

```
curl -X PUT "172.25.25.54:9200/vivo_voc_result_test_v2/_mapping?pretty" -H 'Content-Type: application/json' -d'
{
    "properties": {
        "duplicate": {
            "properties": {
                "domain": {
                    "type": "long"
                },
                "sub_domain": {
                    "type": "long"
                },
                "cls_1": {
                    "type": "long"
                },
                "cls_2": {
                    "type": "long"
                },
                "cls_3": {
                    "type": "long"
                }
            }
        }
    }
}'
```



```
curl -X PUT "10.192.47.12:11403/vivo_voc_warning/_mapping/_doc?pretty" -H 'Content-Type: application/json' -d'
{
    "properties": {
        "src_from_1": {
            "type": "keyword"
        },
        "src_from_2": {
            "type": "keyword"
        },
        "src_from_3": {
            "type": "keyword"
        }
    }
}'
```





GET /_nodes/stats

可以观察到节点得状态，如queue



分片是自管理的搜索引擎



POST /_reindex

重新将源索引的数据转移导目标索引

```
{
    "source": {
        "index": "vivo_voc_result_test_v2",
        "query": {
            "bool": {
                "must": [
                    {
                        "range": {
                            "src.post_time": {
                                "gte": "2018-01-02 00:00:00",
                                "lt": "2019-01-01 00:00:00"
                            }
                        }
                    }
                ]
            }
        }
    },
    "dest":{
    	"index":"vivo_voc_result_test_v3"
    }
}

```





ES查询语句

```
{
    "bool": {
        "must":     { "match": { "title": "how to make millions" }},
        "must_not": { "match": { "tag":   "spam" }},
        "should": [
            { "match": { "tag": "starred" }}			//should会增加得分
        ],
        "filter": {										//filter速度快，不评分，如不考虑相关性则优先用filter
          "bool": { 
              "must": [
                  { "range": { "date": { "gte": "2014-01-01" }}},
                  { "range": { "price": { "lte": 29.99 }}}
              ],
              "must_not": [
                  { "term": { "category": "ebooks" }}
              ]
          }
        }
    }
}

```



分片数量不能变的原因是文档通过hash（id）%分片数量来存储，若分片变了，就不知道存储在哪个分片了



服务器上使用ES

curl -X GET "10.111.16.216:9200/eccresults/_count?pretty" -H 'Content-Type: application/json' -d'
{
    "query": {
        "bool": {
            "must": [
                {
                    "match_phrase": {
                        "src.from.cls_2.zh": {
                            "query": "呼叫中心"
                        }
                    }
                },

	 {
	            "range": {
	                "src.post_time": {
	                    "gte": "2019-11-05",
	                    "lt": "2019-11-06"
	                }
	            }
	        }
	    ]
	}

}           

}
'





curl -X GET "10.102.113.152:11401/vivo_voc_result/_search?pretty" -H 'Content-Type: application/json' -d'
{
    "query": {
        "bool": {
            "filter": [
                {
                    "bool": {
                        "must": [
                            {
                                "bool": {
                                    "should": [
                                        {
                                            "bool": {
                                                "must": [
                                                    {
                                                        "terms": {
                                                            "question.domain.raw": [
                                                                "产品"
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "question.sub_domain.raw": [
                                                                "AI产品"
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "terms": {
                                                            "question.cls_1.raw": [
                                                                "语音助手"
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "terms": {
                                    "question.sentiment.raw": [
                                        "负向"
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "range": {
                        "src.post_time": {
                            "gte": "2019-02-25 23:41:07",
                            "lte": "2020-03-28 09:41:06"
                        }
                    }
                }
            ],
            "must": {
                "bool": {
                    "should": [
                        {
                            "match_phrase": {
                                "src.content": "帅气"
                            }
                        }
                    ],
                    "must": [
                        {
                            "match_phrase": {
                                "src.content": "吴亦凡"
                            }
                        },
                        {
                            "match_phrase": {
                                "src.content": "蔡徐坤"
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "match_phrase": {
                                "src.content": "篮球"
                            }
                        }
                    ]
                }
            }
        }
    },
    "aggs": {
        "date_histogram": {
            "date_histogram": {
                "field": "src.post_time",
                "interval": "quarter",
                "format": "yyyy'Q'q",
                "min_doc_count": 0
            },
            "aggs": {
                "device.standard.brand": {
                    "terms": {
                        "field": "device.standard.brand.raw",
                        "size": 1000
                    }
                }
            }
        }
    },
    "from": 0,
    "size": 0,
    "sort": [],
    "_source": {
        "exclude": []
    },
    "track_total_hits": true
}
'







去重统计

```
"aggs" : {
        "distinct_colors" : {
            "cardinality" : {
              "field" : "color",
              "precision_threshold" : 100 
            }
        }
    }
```





match查询分词，match_phrase查询不分词

"match_phrase": {
                                    "src.content": "吴亦凡"
                                }





sum用来累加分桶的某个字段的值



"aggs": {
        "sales_per_month": {
            "terms": {
                "field": "src.from.cls_2.zh.raw",
                "size": 1000
            },
            "aggs": {
                "sales_time.sales_month": {
                    "sum": {
                        "field": "sales_time.sales_month"
                    }
                },
                "sales_time.sales_week": {
                    "sum": {
                        "field": "sales_time.sales_week"
                    }
                },
                "sales_time.sales_day": {
                    "sum": {
                        "field": "sales_time.sales_day"
                    }
                }
            }
        }
    },





在服务器上定义映射

curl -X PUT "10.102.113.152:11401/vivo_voc_corrected_data_v0" -H 'Content-Type: application/json' -d'
{
    "settings": {
        "analysis": {
            "normalizer": {
                "my_normalizer": {
                    "type": "custom",
                    "filter": [
                        "asciifolding"
                    ]
                }
            }
        },
        "index": {
            "number_of_shards": 5,
            "number_of_replicas": 1
        }
    },
    "mappings": {
        "properties": {
            "apk": {
                "properties": {
                    "id": {
                        "type": "text",
                        "fielddata": true,
                        "analyzer": "ik_max_word",
                        "search_analyzer": "ik_smart",
                        "fields": {
                            "raw": {
                                "type": "keyword",
                                "normalizer": "my_normalizer",
                                "ignore_above": 256
                            }
                        }
                    },
                    "name": {
                        "type": "text",
                        "fielddata": true,
                        "analyzer": "ik_max_word",
                        "search_analyzer": "ik_smart",
                        "fields": {
                            "raw": {
                                "type": "keyword",
                                "normalizer": "my_normalizer",
                                "ignore_above": 256
                            }
                        }
                    },
                    "package": {
                        "type": "text",
                        "fielddata": true,
                        "analyzer": "ik_max_word",
                        "search_analyzer": "ik_smart",
                        "fields": {
                            "raw": {
                                "type": "keyword",
                                "normalizer": "my_normalizer",
                                "ignore_above": 256
                            }
                        }
                    },
                    "version": {
                        "type": "text",
                        "fielddata": true,
                        "analyzer": "ik_max_word",
                        "search_analyzer": "ik_smart",
                        "fields": {
                            "raw": {
                                "type": "keyword",
                                "normalizer": "my_normalizer",
                                "ignore_above": 256
                            }
                        }
                    }
                }
            }
        }
    }
}
'





curl -X POST "10.192.47.12:11403/vivo_voc_corrected_data_v0/_delete_by_query" -H 'Content-Type: application/json' -d'
{
    "query": {
        "range": {
            "src.post_time": {
                "gte": "2021-01-01 00:00:00"
            }
        }
    }
}
'



```
curl -X POST "10.192.47.12:11403/vivo_voc_analysis_v0/_delete_by_query" -H 'Content-Type: application/json' -d'
{
    "query": {
        "match_all": {}
    }
}'
```



删除索引

curl -X DELETE "10.192.47.12:11403/vivo_voc_result_test_v4"

curl -X DELETE "10.192.47.12:11403/vivo_voc_warning_li_v3"



查看所有索引

curl -XGET 'localhost:9200/_cat/indices?v&pretty'



修改别名

```
curl -X POST "10.193.160.129:11402/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions": [
        {
            "add": {
                "index": "vivo_voc_crisis_keyword_v1",
                "alias": "vivo_voc_crisis_increase"
            }
        }
    ]
}'
```



curl -H "Content-Type: application/json" -XPUT 10.192.47.12:11403/vivo_voc_result_test_v4/_settings -d '{"index.max_result_window":"1000000"}'

curl -H "Content-Type: application/json" -XPUT 10.192.47.12:11403/_cluster/settings -d '{"persistent": {"search.max_buckets": 200000}}'







```
{
	"query": {
		"bool": {
			"must": [
				{
					"term": {
						"device.standard.name.raw": "iQOO Pro 5G"
					}
				},
				{
					"range": {
						"src.post_time": {
							"gte": "2020-01-01 00:00:00",
							"lt": "2020-02-01 00:00:00"
						}
					}
				}
			]
		}
	},
	"aggs": {
		"src.id": {
			"cardinality": {
				"field": "src.id.raw",
				"precision_threshold": 20000
			}
		}
	}
}
```

