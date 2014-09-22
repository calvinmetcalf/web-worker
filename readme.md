web-worker
====

Simple web worker creation library, for use in browserify, pass it a string, gives you a blob worker.

Also includes a shim for browsers that don't support blob workers

Caveats

- script imports need to be turned into absolute links, this will import ones inside comments
- not all errors inside of iframes will be caught
- shimed self in iframe doesn't have anything except worker specific things.