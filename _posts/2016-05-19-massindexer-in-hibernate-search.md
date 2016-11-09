---
layout: post
title:  "MassIndexer in Hibernate Search"
date:   2016-05-19 19:00:00 +0100
categories: hibernate-search
redirect_from:
  - /hibernate-search/
---

In this chapitre, I'll focus on how batch indexing is implemented in hibernate 
search via the package `org.hibernate.search.batchindexing`. These details can
be found in GitHub - Hibernate/hibernate-search, under folder 

    hibernate-search/orm/src/main/java/org/hibernate/search/batchindexing

## impl vs spi

Under this folder, there're 2 folders, called `impl` and `spi`. So, what are 
the differences between them ? 

<!--more-->

*  __impl__  
   This package is the current implementation of mass indexing. And it is the
   core of this article. 

*  __spi__  
   In this package, there're 2 interfaces available for implement our own
   mass-indexer. Interface `MassIndexerWithTenant` can be used for class 
   assignment for a tenant in architectures with multi-tenancy. And interface
   `MassIndexerFactory` contains methods that can be used to created a 
   mass indexer.

## Different classes in the current implementation

There're 12 classes in the package, which are :

*  `BatchCoordinator`  
   makes sure that several different
   `BatchIndexingWorkspace` can be started concurrently, sharing the same
   batch-backend and index writers.

*  `BatchIndexingWorkspace`  
   This runnable will prepare a pipeline for batch
   indexing of entities, managing the life cycle of several thread pools.

*  `BatchTransactionalContext`  
   Value holder for the services neede by the mass
   indexer to wrap operations in transactions.

*  `DefaultMassIndexerFactory`  
   The `MassIndexer` implementation used when none
   is specified in the configuration.

*  `ErrorHandledRunnable`  
   Common parent of all Runnable implementations for the
   batch indexing: share the code for handling runtime exceptions.

*  `IdentifierConsumerDocumentProducer`  
   This `SessionAwareRunnable` is
   consuming entity identifiers and producing corresponding `AddLucenWork` 
   instances being forwarded to the index writing backend. It will finish when
   the queue it is consuming from will signal there are no more identifiers.

*  `IdentifierProducer`  
   This `Runnable` is going to feed the indexing queue
   with the identifiers of all the entities going to be indexed. This step in 
   the indexing process is not parallel (should be done by one thread per type)
   so that a single transaction is used to define the group of entities to be 
   indexed. Produced identifiers are put in the destination queue grouped in
   list instances: the reason for this is to load them in batches in the next
   step and reduce contention on the queue.

*  `MassIndexerImpl`  
   Prepares and configures a `BatchIndexingWorkspace` to
   start rebuilding the indexes for all entity instances in the database. The 
   type of these entities is either all indexed entities or a subset, always
   including all subtypes.

*  `OptionallyWrapInJTATransaction`  
   Wrap the execution of a `Runnable` in a JTA
   transaction if necessay: if the existing Hiberante Core transaction strategy
   requires a TransactionManager or no JTA trasaction is already started.
   Unfortunately at this time we need to have access to 
   `SessionFactoryImplemtor`.

*  `ProducerConsumerQueue`  
   Implements a blocking queue capable of storing a 
   poison token to signal consumer threads that the task is finished.

*  `SimpleIndexingProgressMonitor`  
   A very simple implementation of
   `MassIndexerProgressMonotor` which uses the logger at INFO level to output
   speed statisics.

*  `StatelessSessionAwareRunnable`  
   An interface to run `StatelessSession`.

### IdentifierProducer

This `Runnable` is going to feed the indexing queue with the identifiers of
all the entities going to be indexed. Its core method is `loadAllIdentifiers()`. 
In this function, monitor will be updated by a simple row-count operation. 
(TODO: this is useful for my own implementation using JSR 352!). Then, the 
results will be fetched by chunk, and loaded in a destionation list (TODO:
this list should have another name, more meanful). Once finished, then put into
the queue. During the construction of this class, 9 parameters are required.

*  `ProducerConsumerQueue<List<Serializable>> fromIdentifierListToEntities`  
   is the target queue where the identifiers will be sent once the production
   is finished. 

*  `SessionFactory sessionFactory`  
   is the hibernate session factory used to load entities.

*  `int objectLoadingBatchSize`   
   is the bacth size which defines the number of entities to process per query.

*  `Class<?> indexedType`  
   the class type of the class. It will be used for loading the correct entity.
   I think it should better rename it the `indexedClazz`. But well, it is not
   up to me ...

*  `MassIndexerProgressMonitor monitor`  
   is the monitor for the whole batch index process. (Is this class missing 
   from the project on Github?)

*  `long objectsLimit`  
   is the limit of returned results from hibernate session factory. Set to 0 if 
   there's no limit.

*  `ErrorHandler errorHandler`  
   is the error handler in case of exceptions.

*  `int idFetchSize`  
   is the fetched results ids' limit. The `MassIndexer` uses a forward-only
   scorllable result to iterate on the primary keys to be loaded, but MySQL's
   JDBC driver will load all values in memory. To avoid this "optimization",
   set it to `Integer.MIN_VALUE`

*  `String tenantId`  
   is the tenant identifer. Cannot understand why it should be used ? The
   entity information is already contained in the producer consumer queue.
   (I need more time to figure it out)

### ProducerConsumerQueue

Create a blocking queue to control the statuses of different identifier 
producers progress. (only for stopping task for instant)

### MassIndexerImpl

Prepares and configures a `BatchIndexingWorkspace` to start rebuilding the
indexes for all entity instances in the database. The type of these entities
is either all indexed entities or a subset, always including all sub types.

