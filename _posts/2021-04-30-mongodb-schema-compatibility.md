---
layout:              post
title:               在MongoDB中增删字段真的这么简单？
subtitle:            >
    在MongoDB中实现向后兼容的结构（schema）变化。

date:                2021-04-30 23:09:38 +0800
categories:          [java-serialization, reliability]
tags:                [java, mongodb, serialization, jackson, reliability]
comments:            true
excerpt:             >
    本文探讨如何在MongoDB中实现向后兼容的结构（schema）变化，也就是如何在保证生产环境安全的情况下从MongoDB集合中添加或删除字段？
image:               /assets/bg-bence-sandor-sztrecska-wIs-mjKMiw4-unsplash.jpg
cover:               /assets/bg-bence-sandor-sztrecska-wIs-mjKMiw4-unsplash.jpg
article_header:
  type:              overlay
  theme:             dark
  background_color:  "#203028"
  background_image:
    gradient:        "linear-gradient(135deg, rgba(0, 0, 0, .3), rgba(0, 0, 0, .2))"
wechat:              true
ads:                 none
---
## 前言

如果你使用 MongoDB 作为数据库的话，更改 MongoDB 的集合（collection）对你来说肯定是家常便饭。比如说，当业务发展时，我们需要添加新字段（field）到特定的集合中，或者从目标集合中删除现有字段，以支持更多的产品需求。这个操作看起来非常简单，只要往 Java 里面加个新的字段就行了。然而，它远比想象中复杂和危险。万一考虑不周，就有可能会触发线上事件，甚至导致服务中断。在这篇文章里，我们将会探讨哪些地方可能出错、如何安全地更改 schema，以及如何排查问题。本文假设你已经熟悉地掌握了 MongoDB 的基本概念，以及将 Jackson 用作你 Java 程序的序列化框架。

阅读本文后，你会明白：

- 添加新字段时的潜在风险
- 如何用默认值填充缺失的数据
- 如何写单元测试
- 如何迁移现有的文档
- 如何给最坏的情况的情况作准备：撤销代码变更，恢复旧版
- 如果事故发生了，如何使用 Mongo 语句来解决问题？
- 如何从这篇文章拓展出去？

这篇文章是用 MongoDB 4.2、Jackson 2.12、以及 Java 11 写的，但文章概念并不依赖这些新版本，应该对旧版本也有效。文章有点长，因为涉及到的知识点很多。希望大家不要嫌弃，读过以后应该会有新的收获！

## 潜在的风险

_增加一个新的字段（field）时，有可能出现什么问题？_

如果我们在 Java 类中添加了一个新字段而不更改 MongoDB 数据库中的现有文档，反序列化（deserialization）可能会出现严重的错误。这主要是由于 Java 类里面的字段声明和数据库实际存储文档的不一致导致的。这么说有点抽象。我们来看个例子吧，看看会有什么问题。比如我们在做一个电商网站，Java 中有一个代表订单的类，叫做`OrderV1`。这个订单的第一个版本 V1 包含 3 个字段：MongoDB 中的 Object ID、客户 ID 以及此订单的金额。然后最近产品经理希望添加“取消订单”这个功能，因此我们需要一个新的字段`isCanceled`来支持此这个新功能，它也成为了我们订单的 V2 版`OrderV2`。此外，产品经理还希望添加一个操作员（operator）来跟踪处理订单的人。整个更改看起来非常简单，实现起来就是：

```diff
-public class OrderV1 {
+public class OrderV2 {

   @JsonProperty("_id")
   private final String id;

   @JsonProperty("customerId")
   private final String customerId;

   @JsonProperty("amount")
   private final double amount;

+  @JsonProperty("isCanceled")
+  private final boolean isCanceled;

+  @JsonProperty("operator")
+  private final String operator;

   ...
 }
```

但你马上会看到，这里有一些重大风险。根本不像想象中那么简单！

### 风险一：NullPointerException 异常

在不改变 MongoDB 现有文档的情况下，在 Java 类中加入的新字段以后，已有文档的相应字段可能被设定为 null，比如字段“操作员（operator）”。这是因为这些 Mongo 文档不存在“操作员”这个字段。在 Java 中，那些被设置为 null 被引用的时候，就会触发 NullPointerException 异常。我们需要额外小心地处理这种情况：要么在 Java 代码中的处理，有么在 MongoDB 中处理。我们将在下文详细讨论这些技巧。

### 风险二：无法撤销代码变更

另一个风险是无法撤销（revert）代码变更。如果没有对 Jackson Object Mapper 或对 Java 类进行额外配置，那一旦将新版代码部署到生产线中，我们极有可能无法将其安全地回滚到上一个版本。因为一旦 Java 的代码被 revert，那些在新版本部署以后创建的 MongoDB 文档，它们的反序列化将完全失败并抛出“字段无法识别”的异常（UnrecognizedPropertyException）：

> "java.io.UncheckedIOException:
> com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field
> "isCanceled" (class io.mincong.mongodb.model_changes.OrderV1), not marked as ignorable (3
> known properties: "amount", "customerId", "\_id"]) at ...

这是因为新文档中有字段"是否被取消（isCanceled）"，但旧订单类 OrderV1 不知道如何去反序列化它。试想一下在生产线上发生这样的事：我们发现部署的 V2 版本无法正常使用，想回到 V1 版本。结果撤销了代码，但服务器里面却不断地产生“字段无法识别”的异常。。。这是一起严重的事故，足以中断正常的服务使用！

现在，我们更好地了解了添加新字段的两个风险，让我们看看如何使用不同的方案来改善它们，避免事故的发生。

## 处理 null 值

为了防止 NullPointerException 异常的出现，我们可以通过提供默认值来应对 Java 中缺失的数据。有 4 种方法可以做到这一点：

- 使用 Java 的语言特性避免 null 值
- 在构造器中填充 null 值
- 在 getter 中填充 null 值
- 使用额外的 Jackson 模块填充 null 值

### 使用 Java 的语言特性避免 null 值

当类属性（class attribute）为原始类型（primitive type）时，Jackson 会为我们选择默认值。对于 boolean，它默认为 false；对于 int，它默认为 0；对于 double，它默认为 0.0 等。因此，我们可以依靠此特性来避免在 Java 应用程序中出现 null 的情况。例如，为了表示订单是否被取消，我们可以对该字段使用 boolean。当 Mongo 文档中不存在此字段时，Java 会默认为“isCanceled=false”。这意味着此订单是有效订单，而不是被取消的订单。

```java
public class OrderV2 {

  /**
   * This is a new boolean field.
   *
   * <p>For existing documents which do not contain this field, the
   * deserialization defaults to `false`.
   */
  @JsonProperty("isCanceled")
  private final boolean isCanceled;

  ...
}
```

另外，我想强调一下在选择形容词时要小心敬慎。我们要确保 false 对于缺失字段的文档具有正确的含义。例如，如果我们要用一个字段以一个物品的可见性，有两种选择：是“isHidden”还是“isVisible”。这时候应该选哪一个呢？我们也许应该选择形容词是“isHidden”，而不是“isVisible”。因为对于现有的 Mongo 文档，它们没有关于可见性的字段。在这种情况下：

- 当字段不存在时，“isHidden”默认为 false，也就是“可见”
- 当字段不存在时，“isVisible”默认为 false，也就是“不可见”。

通常情况下，我们可能更需要“默认可见”，而不是“默认隐藏”。所以“isHidden”是一个比“isVisible”更好的选择。

### 在构造器中填充 null 值

另一种方法是在 Java 类的构造器中处理 null 的问题。因为当反序列化（deserialization）发生时，Jackson 通过注解“@JsonCreator”找到需要使用的构造器，并用来创建 Java 实例。所以说，在构造器中填充 null 值也是处理的好时机。下面举个例子，一方面我们有个 Java 类：它的构造器含有一个处理可能为 null 的 operator 的 if 语句：

```java
public class OrderV2 {

  @JsonProperty("operator")
  private final String operator;

  ...

  @JsonCreator
  public OrderV2(
      @JsonProperty("_id") String id,
      @JsonProperty("customerId") String customerId,
      @JsonProperty("amount") double amount,
      @JsonProperty("isCanceled") boolean isCancelled,
      @JsonProperty("operator") String operator,
      @JsonProperty("productIds") List<String> productIds) {
    ...

    if (operator == null) {
      this.operator = "support@example.com";
    } else {
      this.operator = operator;
    }
  }

  ...
}
```

另一方面，我们有一个存储在 MongoDB 里面、需要被反序列化成 Java 的 JSON 文档，它并不含有字段 operator：

```json
{
  "_id": "1",
  "customerId": "Customer1",
  "amount": 100.0
}
```

通过 IntelliJ 的 debug 我们可以看见，在反序列化的过程中，operator 这个字段被 Jackson 视为 null，传给 Java 的构造器。但是在构造器中，它被修改了，默认值为“support@example.com”。也就是说，null 被妥善地处理了：

![Handle null in constructor](/assets/20210227-handle-null-in-constructor.png)

### 在 getter 中填充 null 值

跟构造器相似的另一个方法是在 getter 中填充 null 值：

```java
public class OrderV2 {

  @JsonProperty("operator")
  private final String operator;

  ...

  public String getOperator() {
    return operator == null ? "support@example.com" : operator;
  }

}
```

### Jackson Jdk8Module

还有一种解决方案是使用 Java 的“Optional”类，结合 Jackson 模块 Jdk8Module 来处理序列化和反序列化。你可以访问 GitHub 项目 [FasterXML/jackson-modules-java8](https://github.com/FasterXML/jackson-modules-java8) 或阅读 Baeldung 上的文章 ["Using
Optional with Jackson"](https://www.baeldung.com/jackson-optional) 来了解具体的用法。

## 写单元测试

为了更好地模拟更改增删字段的影响，我们可以写一些单元测试来测试不同的行为。写这一个章节的目的并不是为了说服大家测试所有的行为、涵盖所有的情况，因为这是非常耗时的一件事情。我只是想通过这个章节，分享不同的测试技术角度，证明它们是可行的。至于具体测试哪个方面，大家可以根据自己的情况考虑。

### 测试序列化

我们可以写测试确保序列化的正确性。也就是说，一方面 Java 的实例可以被序列化成 MongoDB 里面的文档，然后另一方面它能够被反序列化成 Java 里面的实例，而且反序列化的结果等于原来的初始实例。用图表示就是：

```
Java                 MongoDB
---                  ---
orignal (V2)  -----> Mongo document
restored (V2) <-----
```

代码：

```java
// Given
var result = orderCollection.insertOne(order1);

// When
var results = orderCollection.find(Filters.eq("customerId", "BigCorp"));

// Then
assertThat(results).containsExactly(order1);
```

### 测试向后兼容性

我们也可以写测试确保向后兼容性（Backward-Compatibility），证明使用新的 Java 类（新的代码版本）是可以向后兼容的、不会出现异常或者被错误地反序列化。这么做是为了证明已经存在与数据库的数据不会因为 Java 那边的变化产生兼容性问题。因为我们修改了 Java 类（增加了新的字段），但是我们并没有做数据迁移。这个测试起来有点难，因为 Java 的版本已经改变了，在 Java 里面无法再创建出旧版本的那种结构。为了模拟这种情况，我们可以直接造一个原始的（raw）BSON 文档，嵌入数据库，然后再进行反序列化：

```java
Document.parse("{ \"_id\": \"1\", \"customerId\": \"Customer1\", \"amount\": 100.0 }");
```

把上面的话画成图来表示的话，应该是下面这样。我们先在测试中创建一个 BSON 文档并放入数据库，然后在测试中把文档反序列化，证明反序列化的结果是我们期待的样子。它跟“测试序列化”不同的点在于：上文的 BSON 文档是由当前版本的 Java 代码创建的，这里的 BSON 文档是由旧版本的 Java 代码创建的（模拟已经存在数据库的数据）。目的是为了测试向后兼容性。

```
Java                 MongoDB
---                  ---
BSON (V1)     -----> Mongo document
restored (V2) <-----
```

你可以看到在上面 raw 文档中，我们没有加入新的字段`isCanceled`，这样等于模仿了在 schema 改变之前，数据库中数据的模样。这样一来，我们就可以测试反序列化的正确性，保证反序列化的结果是我们期待的那样。

### 测试回滚（rollback）

你也可以测试回滚到上一个代码版本是安全的。也就是说，把一个新版本的代码序列化到 Mongo 数据库里面以后，用旧版本的代码去反序列化也能够正确地实现。画个图来表示就是：

```
Java                  MongoDB
---                   ---
original (V2)  -----> Mongo document
restored (V1) <-----
```

这样做的目的主要是为了证明：当新版本被部署到生产线以后发生异常，我们至少可以安全地撤销这个变更，回到上一个版本。因为我们在上文中提到，撤销有可能导致“字段无法识别”的异常（UnrecognizedPropertyException）。

## 迁移已有文档

上文提到的避免 NullPointerException 主要是通过在 Java 代码中提供默认值实现的。除了提供默认值外，还有没有别的做法呢？另一种做法就是迁移数据。我们可以迁移 MongoDB 中的已存在文档来保证序列化的正确性。在执行 Mongo 语句之前，请考虑：

- 是否需要备份？理想情况下，备份是定期自动执行的。如果没有自动备份，那考虑使用导出工具 [mongoexport](https://docs.mongodb.com/database-tools/mongoexport/) 来备份相关文档。
- 在生产线（production）实施迁移之前，有没有在本地或者 staging 环境中测试过要执行的语句？
- 在执行之前，有没有让至少一位同事去核对语句的正确性？
- 有没有在聊天工具中留下点记录，例如在 Slack 或 Microsoft Team，以跟踪操作？
- 有没有在批量修改多个文档之前，先试试修改一个文档？

现在，回到 Mongo 语句本身。这可以很简单：

```js
db.orders.update(
  { isCanceled: { $exists: false } },  // 1
  { $set: { isCanceled: false } },  // 2
  { multi: true }  // 3
)
```

在这个语句里面：

1. 我们找出集合“订单”（orders）中不包含字段“isCanceled”的文档。
2. 然后，对于这些文档，我们设置字段值为“false”。
3. 默认情况下，修改语句仅更新单个文档。我们将其设置为更新多个选择—所有匹配的文档（不含有字段“isCanceled”）都会被修改。注意，这里最好执行两次更新查询：第一次修改一个文档来测试更新语句是否有效（使用选项`{ multi: false }`）。然后第二次使用选项`{ multi: true }`，以更新与选择匹配的所有文档。这样的做法可以降低破坏整个集合的风险。

更新结果会显示所涉及的文档数量：与查询匹配的文档数量、更新或插入的文档数量以及修改的文档数量。

```js
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
```

## 准备回滚

在上文“潜在的风险”中，我们提到，回滚到 Java 程序的上一个版本可能是不可能的。回滚可能导致反序列化失败：

> "java.io.UncheckedIOException:
> com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException: Unrecognized field
> "isCanceled" (class io.mincong.mongodb.model_changes.OrderV1), not marked as ignorable (3
> known properties: "amount", "customerId", "\_id"]) at \[Source: (String)"{"\_id": "2",
> "customerId": "Customer2", "amount": 200.0, "isCanceled": true, "operator":
> "emea@example.com", "productIds": ["A", "B", "C"]}"; line: 1, column: 77] (through reference
> chain: io.mincong.mongodb.model_changes.OrderV1["isCanceled"])"

这是因为新文档有字段"isCanceled"，但旧值类订单不知道如何去反序列化它！下面，我们将看到如何在 Jackson 中正确处理这个“字段无法识别”的错误。

### 全局处理

我们可以通过 Object Mapper 来对未知字段进行全局处理，让 Jackson 在面对所有的类都使用一样的处理方式。这个特性是"FAIL_ON_UNKNOWN_PROPERTIES"。我们可以让它不要抛出异常：

```java
objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
```

```java
objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
```

这样处理的话，所有通过这个 object mapper 反序列的 JSON 都不会抛出异常。

### 局部处理

我们也可以通过注解（annotation）来对未知字段进行局部处理，让 Jackson 在面对特定的类使用这个处理方式。

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderV1 { ... }
```

这样处理的话，所有被反序列成 OrderV1 的 JSON 都不会抛出异常。与全局配置相比，局部设置允许让我们对不同 Java 类的行为有更精细的控制，但它也容易使程序员忘记要添加此注释。这样做也可能导致不同类的反序列化行为不一致的问题。

无论我们选择哪一种配置，全局或者局部，一旦配置好了，那么回滚就应该是安全的了！没有人希望自己的代码需要被回滚，但是为回滚的安全性做好准备，总是一件能让所有人感到安心的事情。

## 常用的 Mongo 语句

在前几节中，我们主要关注如何保证向后兼容的问题，避免发生线上事故。但是，如果生产线已经出事故了呢？毕竟不是所有人都能意识到他的代码变动可能引发线上事故。因此，学习一些基本的 Mongo 语句，为最坏的情况做好准备也是一件好事。也就是，出事故时如何快速修复。以下是我为大家准备的一些语句。

```js
> db.orders.count()
2
```

计算订单的数量。看看有多少文档可能受牵连，以及出现问题时可能产生的影响。

```js
> db.orders.find({ isCanceled: { $exists: false } }).limit(10).pretty()
{ "_id" : "1", "customerId" : "Customer1", "amount" : 100 }
```

找出前 10 个不含有新字段“isCanceled”的文档并以 pretty 格式显示。在实际更新之前文档或之后检查 JSON 的正确性。

```js
> db.orders.update(
  { isCanceled: { $exists: true } },
  { $unset: { isCanceled: "" } }
  { multi: true }
)
```

对于含有字段“isCanceled”的所有文档删除字段。主要用来回滚。当 Java 代码被回滚到以前的版本，但旧版代码缺乏对 Jackson 的配置的时候导致反序列化失败的时候，可以快速删除新添加的字段。

## 其他场景

在上面的章节中，我们主要讨论了在向 MongoDB 添加新字段时发生的情况。但是有没有其他场景呢？

- 另一个常见情况是删除字段。删除字段可能也有问题，因为 Java 类可能不能正确地处理未知的字段。这正是我们在"准备回滚"部分讨论的内容。
- 另一种可能的情况是更改现有字段的类型。比如说把 int 改成 string。我建议避免这样做，我们完全可以使用其他名称创建新字段来避免序列化的错误。
- 在 Java 的 enum 中重命名或删除一个项。重命名 Java 类里面的 enum 是没问题的，但请确保 JSON 属性（JsonProperty）的命名不会随之改变。例如，通过将 enum 的一个项从 FOO 重命名为 BAR，默认的序列化也将从“FOO”更改为“BAR”，这可能产生严重的错误。删除一个项也是很危险的。在执行此操作之前，请确保此项不存在于 staging 和 production 任何数据库中。

上面只是我想到的一些场景，肯定也有一些别的场景是我没有想到的。欢迎大家留言讨论你们的观点。

## 拓展

如何从这篇文章拓展出去？

- 本文假设你使用 Jackson Databind 来处理 Java 与 MongoDB 之间的序列化和反序列化。如果你没有使用它，并希望尝试一下，看看 StackOverflow 的这个问题：[Is there any way for creating Mongo codecs automatically?](https://stackoverflow.com/a/47949886/4381330)。我的代码主要是受到 Kevin Day 答案写的。
- 想要了解更多关于 MongoDB 操作的信息，如`$set`、`$unset`，请访问 MongoDB 官方文档 ["Update
  Operators"](https://docs.mongodb.com/manual/reference/operator/update/)。
- 要了解有关数据库工具 mongodump 的更多信息，请访问 MongoDB 文档 [mongodump](https://docs.mongodb.com/database-tools/mongodump/#mongodb-binary-bin.mongodump)。

你还可以在我的 GitHub 项目 [mincong-h/java-examples](https://github.com/mincong-h/java-examples/tree/blog/mongo-schema-compatibility/mongo) 下找到本文的源代码。

## 结论

在本文中，我们看到了在 Java 应用程序中添加新字段时的对于 MongoDB 产生的潜在风险（NullPointerException 和无法安全回滚的问题）、填充 null 值的不同技术、如何编写单位测试、如何迁移现有文档、如何通过配置 Object Mapper 或添加 Java 注解（annotation）来正确处理未知字段为准备回滚作准备，以及一些有用的 MongoDB 语句，以帮助大家在出现事故时快速排查和修复问题。最后，我们还简要讨论了其他的场景，并且分享了一些让大家拓展出去的资源。希望这篇文章能够给你带来一些思考，让你的系统变得更加稳健可靠。谢谢大家！

## 参考文献

- MongoDB, "MongoDB Documentation", 2021.
  <https://docs.mongodb.com/>
- Tatu Saloranta et al., "Jackson Databind", 2021.
  <https://github.com/FasterXML/jackson-databind>
