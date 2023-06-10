---
article_num: 180
layout:              post
title:               Spring Data MongoDB 入门
subtitle:            >
    在 Java 项目中使用 Spring Data MongoDB 框架与 MongoDB 交流。

lang:                zh
date:                2021-06-26 10:30:30 +0200
categories:          [java-core]
tags:                [java, spring, mongodb, lombok]
comments:            true
excerpt:             >
    在 Java 项目中使用 Spring Data MongoDB 框架与 MongoDB 交流。

image:               /assets/bg-mohammad-ali-jafarian-NEn-mUKde6I-unsplash.jpg
cover:               /assets/bg-mohammad-ali-jafarian-NEn-mUKde6I-unsplash.jpg
redirect_from:
  - /2021/06/26/spring-data-mongodb/
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .6), rgba(0, 0, 0, .4))"
wechat:              true
---

## 前言

[Spring Data for MongoDB](https://spring.io/projects/spring-data-mongodb) 是 Spring Data 项目的一部分，该项目旨在为新数据存储提供熟悉且一致的基于 Spring 的编程模型，同时保留特定于存储的特性和功能。在这篇文章，我将跟大家看看如何使用这个框架。

阅读本文后，你会明白：

- 为什么要使用 Spring Data MongoDB？
- 如何安装？
- 如何创建 POJO？
- 如何创建服务？
- 如何配置 MongoDB？
- 如何测试？

事不宜迟，让我们马上开始吧！

## 使用目的

为什么使用 Spring Data MongoDB？Spring Data MongoDB 项目提供与 MongoDB 文档数据库的集成。Spring Data MongoDB 的关键功能是以 POJO 为中心的模型，用于与 MongoDB DBCollection 交互并轻松编写 Repository 样式的数据访问层。

- Spring 配置支持：使用基于 Java 的 `@Configuration` 类或基于 XML 命名空间的配置来驱动 Mongo 实例和副本。
- MongoTemplate 辅助类：可提高执行常见 Mongo 操作的效率，包括文档和 POJO 之间的集成对象映射。
- 异常处理：异常转换为 Spring 的可移植的数据访问异常层次结构
- 功能丰富的对象映射与 Spring 的转换服务集成
- 基于注释的映射元数据、并且可扩展以支持其他元数据格式
- 持久化和映射生命周期事件
- 使用 MongoReader/MongoWriter 抽象的低级映射
- 基于 Java 的查询、条件和更新 DSL
- Repository 接口的自动实现，包括对自定义查询方法的支持。
- QueryDSL 集成以支持类型安全的查询，以及地理空间整合
- Map-Reduce 集成
- JMX 管理和监控
- 对存储库的 CDI 支持
- GridFS 支持

## 安装

这篇文章主要是用 spring-boot-starter-data-mongodb，这样可以将结合 Spring Data 和 Spring Boot 结合使用。

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-mongodb</artifactId>
  <version>2.5.2</version>
</dependency>
```

从对 Maven 依赖树分析来看，它依赖了 mongodb-driver-sync 4.2.3 以及 spring-data-mongodb 3.2.2 这两个库。然后它们又有各自的依赖关系，主要用了 Spring 5.3：

```
mvn dependency:tree
...
[INFO] +- org.springframework.boot:spring-boot-starter-data-mongodb:jar:2.5.2:compile
[INFO] |  +- org.mongodb:mongodb-driver-sync:jar:4.2.3:compile
[INFO] |  |  +- org.mongodb:bson:jar:4.2.3:compile
[INFO] |  |  \- org.mongodb:mongodb-driver-core:jar:4.2.3:compile
[INFO] |  \- org.springframework.data:spring-data-mongodb:jar:3.2.2:compile
[INFO] |     +- org.springframework:spring-tx:jar:5.3.8:compile
[INFO] |     +- org.springframework:spring-context:jar:5.3.8:compile
[INFO] |     |  \- org.springframework:spring-aop:jar:5.3.8:compile
[INFO] |     +- org.springframework:spring-beans:jar:5.3.8:compile
[INFO] |     +- org.springframework:spring-expression:jar:5.3.8:compile
[INFO] |     \- org.springframework.data:spring-data-commons:jar:2.5.2:compile
```

这里使用的是目前的最新版。但是根据每个人的情况不同，可能需要选择其他的版本。如果是已经存在的项目，几个你可能会遇到限制因素是 Spring 项目已有的版本、Spring Boot 已有的版本、以及 MongoDB 的版本。

在下面的段落里面，我们会以 Person 作为例子，介绍如何创建 POJO、创建服务、配置 MongoDB、以及如何测试。

## 创建 POJO

我们首先需要一个 Java 的类来代表 Mongo collection 里面的文档。比如一个 Person 对应的类可能包括三个字段：名称、年龄、以及文档的 ID。这些信息可以用以下的方式表示：

```java
import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@EqualsAndHashCode
@ToString
@Builder
@Document(collection = "people")
public class Person {
  private final String name;
  private final int age;
  private @Getter ObjectId id;
}
```

这里用到了 [Lombok](https://projectlombok.org/) 作为框架。这样做的目的主要是避免自己写 getter/setter、生成 hashcode/equal/toString，一方面使得代码更加的简洁，另一方面避免因为错误的实现而出错。这里还使用了它的 builder 功能，因为在真实项目里面通常 POJO 有很多个字段，如果不用 builder 直接使用构造器的话，很容易出错；如果想克隆一个已存在的实例并稍作修改，没有 builder 也很难实现。

使用 Lombok 的时候，除了需要上面的 Java 代码以外，你需要把 Lombok 的库加到你的项目里面。如果是 Maven 项目的话，可以用下面的方式添加：

```xml
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <scope>provided</scope>
</dependency>
```

它的 scope 是 provided，也就是只有编译的时候需要它（compile-only）。Lombok 是通过 Java 编译器的 annotation processor 为你的项目修改代码的，所以在编译结束后不需要再保留在 classpath 里面。

## 创建服务

创建一个基于 Spring 数据服务 `@Service`，用来跟 MongoDB 沟通。比如说，通过“人名”这个信息找到相应的人：

```java
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.stereotype.Service;


@Service
public class PersonService {

  @Autowired MongoOperations operations;

  public Optional<Person> findPerson(String name) {
    var p = operations.findOne(query(where("name").is(name)), Person.class);
    return Optional.ofNullable(p);
  }
}
```

这个 Mongo 操作很好理解，它对应的 Mongo Shell 脚本就是：

```js
db.people.findOne({ name: input_name })
```

## 创建 MongoDB 配置

创建 MongoDB 的客户端需要一个基于 Java 的 `@Bean`，然后这个方法需要返回一个 `com.mongodb.client.MongoClient` 的实例。但是这个不是唯一的办法，我认为比较好用的方法是继承 String Data Mongo 的抽象类 `AbstractMongoClientConfiguration`，因为它提供了很多可以配置的选项，以 Java 方法的形式展现出来。具体的注解都已经在抽象类实现了，所以作为用户我们只需要关注我们想要修改的参数就行了，比如数据库的名字（database name）、连接字符串（connection string）等。在下面的例子里，我连接到了 localhost 的 MongoDB 里面的数据库 `demo`：

```java
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

  @Override
  public MongoClient mongoClient() {
    return MongoClients.create("mongodb://localhost:27017");
  }

  @Override
  protected String getDatabaseName() {
    return "demo";
  }
}
```

## 测试

测试很简单，如果你使用 Spring Boot 的话，可以使用 spring-boot-starter-test 这个库来帮助测试：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <version>${spring.boot.version}</version>
  <scope>test</scope>
</dependency>
```

如果使用这个库的话，用注解 `@SpringBootTest` 加上相关的需要被测试的类，然后就可以使用了。如果需要在测试过程使用这些类，用把它们通过 `@Autowired` 注入到测试中。下面这个测试就是一个简单的范例，展示如何创建两个人，并且通过名字查询她们的存在：

```java
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;

@SpringBootTest(classes = {PersonService.class, MongoConfig.class})
class PersonServiceIT {

  @Autowired MongoOperations operations;
  @Autowired PersonService personService;

  Person sansa, arya;

  @BeforeEach
  void setUp() {
    this.sansa = Person.builder().name("Sansa Stark").age(20).build();
    this.arya = Person.builder().name("Arya Stark").age(20).build();

    operations.save(sansa);
    operations.save(arya);
    assertThat(operations.findAll(Person.class)).hasSize(2);
  }

  @AfterEach
  void tearDown() {
    operations.remove(new Query(), Person.class);
  }

  @Test
  void queryId() {
    var optPerson = personService.findPerson("Sansa Stark");
    assertThat(optPerson).hasValue(sansa);
  }
}
```

至于 MongoDB 的话，我采用的是使用 Docker 容器的策略：在所有的测试开始前启动一个 Docker 容器给测试使用，然后再测试结束的时候清理数据库。我估计还有别的办法，欢迎大家留言讨论。

## 扩展

如何从这篇文章拓展出去？

- 如果你想知道更多关于 Spring Data MongoDB 的信息，建议访问官网页面 [Spring Data MongoDB - Reference Documentation (3.2.2)](https://docs.spring.io/spring-data/mongodb/docs/3.2.2/reference/html/#reference)
- 如果你想知道更多关于 Lombok 的功能，建议访问官网页面 [Lombok features](https://projectlombok.org/features/all)
- 如果你想知道更多关于 Mongo Shell 的操作，建议访问官网页面 [Collection Methods](https://docs.mongodb.com/manual/reference/method/js-collection/)

如果你想要查看这篇文章对应的[源代码](https://github.com/mincong-h/java-examples/tree/blog/spring-data-mongodb/spring-mongo)，可以访问我的 GitHub 项目 [java-examples](https://github.com/mincong-h/java-examples)。里面不仅要有这篇文章，还有 30 多篇其他文章的源代码。

## 结论

在本文中，我们看到了为什么要使用 Spring Data MongoDB、如何安装、如何创建 POJO、如何创建服务、如何配置 MongoDB、如何测试，并且分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让 MongoDB 整合过程提供一些参考。谢谢大家！如果你有兴趣了解更多的咨询，欢迎关注我的 [GitHub](https://github.com/mincong-h) 或者微信订阅号【码农小黄】。谢谢大家，下次见！

## 参考文献

- Spring authors, "Spring Data MongoDB (3.2.2)", _spring.io_, 2021.
  <https://spring.io/projects/spring-data-mongodb>
- Spring authors, "Spring Data Examples", _github.com_, 2021.
  <https://github.com/spring-projects/spring-data-examples>

写作不易，希望大家点个赞、点个在看支持一下，谢谢(花)
