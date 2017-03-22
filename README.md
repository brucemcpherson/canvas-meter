# effex-api-client
Node api client for Ephemeral exchange

A cross platform cache, with a simple HTTP REST API that supports CORS

## Getting started

```
npm install effex-api-client --save
```

See the tests module for a complete list of everything you can do

to check if everything is working

```
var efx = require ('effex-api-client');

// set up client 
efx.setBase("https://ephex-auth.appspot-preview.com");

efx.ping().then(function(result)  {
  console.log( result.data );
});
```

## The console and dashboard
To create reader and writer keys you'll need an an account (free). See the console to register and to take the API tutorial.
https://storage.googleapis.com/effex-console-static/bundle/index.html#/

## Access keys
Before you can write to the store, you need a writer key. You need to generate writer keys using the API. Here are the different kinds of access keys and how to get them

| Access key type | what are they for | how to get one |
| ------------- |---------------| ---------------| 
| boss     | generating other access keys | from the console app | 
| writer      | reading, updating, writing or removing data from the store | with the API and a boss key |  
| updater | reading and updating data from the store      | with the API and a boss key |
| reader | reading | data from the store      | with the API and a boss key |
| item | needed to access a data item | by writing an item to the store with the API |
| alias | can be used to assign a constant name to a data item | by assigning an alias to to a particular key/item combination using a writer key |

Typically the account owner would keep the boss keys and writer keys private, and share item ,updater or reader keys with collaborators or collaborating applications.

To be able to access an item, these things need to happen
1. A writer key is needed to write data to the store. An item key is generated. The same writer key can be used to write many items. 
2. An item can be read back, updated or removed using the writer key plus the item key.
3. To assign read access to an item, you can specify a comma separated list of readers as a parameter when creating the item. Any reader keys mentioned in that list can read the item using the reader key plus the item key.
4. To assign update access to an item, you can specify a comma separated list of updaters as a parameter when creating the item. Any updater keys mentioned in that list can read or update the item using the updater key plus the item key.
5. To register an alias, you need a writer key and a data item id. You can then register an alias to a key/item combination and that key can use the alias to access the item to which it has been assigned.

## Expiration and disabling
Because this is a store for ephemeral data, everthing expires - accounts, data items, access keys and aliases - and their lifetime can each be individually set. Keys can last for months, but in the free version, data items expire after a maximum of 12 hours although this may be revised as the service comes out of beta.

Lifetimes are set by explicit parameters, or inherited from the key used to create them.

All access keys and items are associated with a specific account and will be immediately stop working if you disable or remove an account. You can create multiple accounts and manage them in the API console. You can stop a boss key being able to generate new keys by deleting it from the API console.

## Security
This is a public store, and there is no authentication required. However, keys are required for all data accesses, and both the data and its keys are encrypted in the store. You may also choose to further encrypt it before sending it to the store too. In any case, to ensure you comply with your country's privacy laws on the storage of personally identifiable data, don't do it. 

# Node client
The API has a simple HTTP REST API - take the tutorial to see the structure of each call if you want to write your own client. https://storage.googleapis.com/effex-console-static/bundle/index.html#/ .You can even use a browser to access the store if you want - handy for debugging. 

For convenience this node client is available, and of course you can use it in a web app too. 

## Initialization
Once you've installed it with npm, 

```
var efx = require ('effex-api-client');

// set up client 
efx.setBase("https://ephex-auth.appspot-preview.com");
```

## Responses
Unless its a transport error, http responses will always be 200. If there is a structural error in your call, or for example, data is missing - this will be reported in the response. 

A typical response would consist of various properties describing the api access. In normal circumstances, the only one of interest is *response.data*, where a successful request would return something as shown below. The rest of the response can be used to find out more detail about the request and for troubleshooting any transport failures.

```
{ writer:"wxk-eb1-o1cbq17qfbre"
  ok:true
  id:"dx1f7-g1x-127ib7e77bfn"
  plan:"x"
  accountId:"1f7"
  lifetime:3600
  size:175
  code:201
}
```
And a fail would be

``` 
{ reader:"wxk-eb1-o1cbq17qfbre"
  ok:false
  id:"dx1f7-51b-1t7ibudfmbfr"
  accountId:"1f7"
  plan:"x"
  value:null
  code:404
  error:"item is missing"
}
```
The property ok is present on all responses and is a simple way to test for success. The code property returns a typical http code for the type of operation being performed. 

## Promises
All responses from api requests are returned as promises.

## Methods
There's an example of a request and response for each of the methods that access the API. This is not an exhaustive list, as it does not cover the administrative account management functions which are not currently available in the free tier.

### Parameters
Many api calls take parameters. They all follow the same format. The data payload can be text or an object, and is specified as a argument to methods that can write or update data.

Here is a list of the parameters that the API understands and where they can be used with this client. Params are always passed as a key/value pair object.


| Parameter | what it is for | can use in client |
| ------------- | ---------------| ---------------|
| data |	If GET is used (rather than POST), this parameter can be used to specify the data to be written | Not needed. It is generated automatically when required |
| readers |	A comma separated list of reader keys that can read this item. | when creating an item | 
| updaters	|A comma separated list of updater keys that can read or update this item. | when creating an item |
| lifetime |	Lifetime in seconds of the data item, after which it will expire | when creating an item or alias |
| callback |	Provide a callback function name to request a JSONP response | all |
| days | How many days an access key should live for | generating access keys |
| seconds | As an alternative to days, how many seconds an access key should live for | generating access keys |



### setBase (url)

Sets the API base url. Note that this is likely to change as the service moves from beta.

```
efx.setBase("https://ephex-auth.appspot-preview.com");
```
### ping ()

Checks the service is up

example
```
efx.ping ()
.then (function (response) {
  // do something with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/ping
```
example response
```
ok:true
value:"PONG"
code:200
```
### info ()

Gets version info for service

example
```
efx.info ()
.then (function (response) {
  // do something with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/info
```
example response
```
ok:true
code:200
▶info:{} 2 keys
api:"effex-api"
version:"1.01"
```

### generateKey (bosskey , type [,params])

Generates 1 or more keys of the given type ('writer', 'updater', 'reader')

example
```
efx.generateKey ("bx1f7-e11-b731jbd5p1fo" , "writer", {count:1} )
.then (function (response) {
  // do something with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/bx1f7-e11-b731jbd5p1fo/writer?count=1
```
example response
```
type:"writer"
plan:"x"
lockValue:""
ok:true
validtill:"2017-03-17T13:01:54.593Z"
▶keys:[] 1 item
0:"wxk-eb1-v5oc917zfbfz"
accountId:"1f7"
```

### validateKey (key)

Validate any kind of key and get its expiration date

example
```
efx.validateKey ("bx1f7-e11-b731jbd5p1fo")
.then (function (response) {
  // do something  with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/validate/uxk-f1z-b17ce5kcvoeb
```

example response
```
ok:true
key:"uxk-f1z-b17ce5kcvoeb"
validtill:"2017-03-17T13:01:53.996Z"
type:"updater"
plan:"x"
accountId:"1f7"
code:200
```
### write (data , writer , method, params)

Write data to the store and get an id back. The method can be post (preferred) or get (for small amounts of data where post is not possible - eg from browser). The params can be used to define which keys can read this item and its lifetime.

example
```
efx.write (data , "wxk-eb1-i5ocq17bfbga")
.then (function (response) {
  // do something  with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/writer/wxk-eb1-i5ocq17bfbga
```

example response
```
writer:"wxk-eb1-i5ocq17bfbga"
ok:true
id:"dx1f7-k19-127mbaeiobft"
plan:"x"
accountId:"1f7"
lifetime:3600
size:175
code:201
```

Here's an example with some reader and updater keys authorized. Note that the keys must be valid unexpired keys for the request to succeed.

```
efx.write (data , "wxk-eb1-v5oc917zfbfz" , "POST" , {
  updaters:"uxk-f1z-b17ce5kcvoeb",
  readers:"rxk-ec5-fc571rowbbf1"
}).then (function (response) {
  // do something
});
```
translates to native api url

```
https://ephex-auth.appspot-preview.com/writer/wxk-eb1-v5oc917zfbfz?readers=rxk-ec5-fc571rowbbf1&updaters=uxk-f1z-b17ce5kcvoeb
```
example response

```
writer:"wxk-eb1-v5oc917zfbfz"
ok:true
id:"dx1f7-811-1576boei2bft"
plan:"x"
accountId:"1f7"
▶readers:[] 1 item
0:"rxk-ec5-fc571rowbbf1"
▶updaters:[] 1 item
0:"uxk-f1z-b17ce5kcvoeb"
lifetime:3600
size:211
code:201
```
### read (id,  key , params)

Read a data item from the store, where id is the id returned by a write operation (or an alias - see later), and key is any kind of key that has been authorized to read this item. Note that a writer key can always read, update or remove an item it has created.

example
```
efx.read ("dx1f7-s18-167ibfeb9bfm", "rxk-ebb-fe971gtqbbt1")
.then (function (response) {
  // do something  with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/reader/rxk-ebb-fe971gtqbbt1/dx1f7-s18-167ibfeb9bfm
```

example response. The data payload will be in the value property.
```
reader:"rxk-ebb-fe971gtqbbt1"
ok:true
id:"dx1f7-s18-167ibfeb9bfm"
accountId:"1f7"
plan:"x"
value:"a data item that can be read by another"
code:200
modified:1489752873661
```

### update (data, id, updater, method  , params)

Update a data item in the store, where id is the id returned by a write operation (or an alias - see later), and key is any kind of key that has been authorized to update this item. Note that a writer key can always update an item it has created, and data is the new value to set for the given item id. As with write, it is possible (but not preferred), to use a GET method instead of the default POST.

example
```
efx.update (data , "dx1f7-m12-167ibfev9bfh", "uxk-f1m-b17ce9uo_t9b")
.then (function (response) {
  // do something  with response.data
});

```
translates to native api url
```
https://ephex-auth.appspot-preview.com/updater/uxk-f1m-b17ce9uo_t9b/dx1f7-m12-167ibfev9bfh
```

example response. 
```
updater:"uxk-f1m-b17ce9uo_t9b"
ok:true
id:"dx1f7-m12-167ibfev9bfh"
plan:"x"
accountId:"1f7"
lifetime:3600
modified:1489752873655
size:196
code:201
```
### remove (id, writer , params)

It's not normally necessary to remove items, as they will expire anyway. Only the writer key that created an item can remove it.

example

```
efx.remove ("dx1f7-s18-167ibfeb9bfm", "wxk-eb1-e9tbh177fbm9")
.then (function (response) {
  // do something  with response.data
});

```
translates to native api url

```
https://ephex-auth.appspot-preview.com/writer/wxk-eb1-e9tbh177fbm9/dx1f7-s18-167ibfeb9bfm
```

example response. 

```
writer:"wxk-eb1-e9tbh177fbm9"
ok:true
id:"dx1f7-s18-167ibfeb9bfm"
accountId:"1f7"
plan:"x"
code:204
```

### registerAlias (writer, key, id, alias, params)

It's possible to use an alias for a data item. This allows you to use a consistent reference to the same data abstaction even though the specific item it refers to changes. Like this, a collaborating app only needs a key that can reference that item along with the alias. 

An alias doesn't apply to a data item - it refers to an access key/data item combination. Assigning the alias to this combination is done with register alias. Only the data item writer key can assign an alias.

example

```
efx.registerAlias ("wxk-eb1-e9tbh177fbm9", "uxk-f1m-b17ce9uo_t9b","dx1f7-m12-167ibfev9bfh","some-awesome-data")
.then (function (response) {
  // do something  with response.data
});
```
translates to native api url

```
https://ephex-auth.appspot-preview.com/wxk-eb1-e9tbh177fbm9/uxk-f1m-b17ce9uo_t9b/alias/some-awesome-data/dx1f7-m12-167ibfev9bfh
```

example response. 

```
type:"alias"
plan:"x"
lockValue:""
ok:true
validtill:"2017-03-17T14:14:31.992Z"
key:"uxk-f1m-b17ce9uo_t9b"
alias:"some-awesome-data"
id:"dx1f7-m12-167ibfev9bfh"
accountId:"1f7"
writer:"wxk-eb1-e9tbh177fbm9"
code:201
```

Once an alias has been established, it can be used anywhere a data id can be used. 

example
```
efx.read ("some-awesome-data", "uxk-f1m-b17ce9uo_t9b")
.then (function (response) {
  // do something  with response.data
});

```
translates to native api url

```
https://ephex-auth.appspot-preview.com/reader/uxk-f1m-b17ce9uo_t9b/some-awesome-data
```

example response. 

```
reader:"uxk-f1m-b17ce9uo_t9b"
ok:true
id:"dx1f7-m12-167ibfev9bfh"
accountId:"1f7"
plan:"x"
alias:"some-awesome-data"
value:"a data item that can be updated by another"
code:200
modified:1489753261680
```


## More stuff
See http://ramblings.mcpher.com/Home/excelquirks/ephemeralexchange for more stuff



