# Think in GraphQL系列
* [GraphQL 入門： Server Setup X NodeJS X Apollo (寫程式囉！)](https://ithelp.ithome.com.tw/articles/10202644)
```graphql
{
    hello
}
```
* [GraphQL 入門：初次實作 Schema 與 Resolver](https://ithelp.ithome.com.tw/articles/10203333)
```graphql
{
    me {
        id
        name
        age
    }
}
```
* [GraphQL 入門： Schema 與 Resolver 進階功能！ (Array, Non-Null, Field Resolver)](https://ithelp.ithome.com.tw/articles/10203628)
```graphql
{
    users {
        id
        name
        friends {
            id
            name
        }
    }
}
```
* [GraphQL 入門： Arguments, Aliases, Fragment 讓 Query 更好用 (進階 Query)](https://ithelp.ithome.com.tw/articles/10203965)
```graphql
{
    # 傳入 Argument "Fong" (Argument for Object Type)
    user(name: "Fong") {
        id
        name
        # 傳入 Argument METRE (Argument for Scalar Type)，
        # 此 field 回傳 FLOAT type
        height
        # 傳入 Argument POUND (Argument for Scalar Type)，
        # 此 field 回傳 FLOAT type
        weight(unit: POUND)
    }
}
```