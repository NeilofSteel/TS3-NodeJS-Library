/*global describe beforeEach it*/
const { deepEqual } = require("assert")
const sinon = require("sinon")
const { assert } = sinon
const mockRequire = require("mock-require")
const mockResponse = require("./mocks/queryResponse.js")
const TeamSpeakServerGroup = require("../src/property/ServerGroup.js")
let TeamSpeak3 = require("../src/TeamSpeak3.js")

mockRequire("../src/transport/TS3Query.js", "./mocks/MockQuery.js")
TeamSpeak3 = mockRequire.reRequire("../src/TeamSpeak3.js")


describe("TeamSpeakServerGroup", () => {
  let rawGroup = null
  let stub = null
  let serverGroup = null

  beforeEach(() => {
    const ts3 = new TeamSpeak3()
    rawGroup = mockResponse.servergrouplist[5]
    stub = sinon.stub(ts3, "execute")
    stub.resolves()
    serverGroup = new TeamSpeakServerGroup(ts3, rawGroup)
  })

  it("should verify the getter value of #sgid()", () => {
    assert.match(serverGroup.sgid, rawGroup.sgid)
  })

  it("should verify the getter value of #name()", () => {
    assert.match(serverGroup.name, rawGroup.name)
  })

  it("should verify the getter value of #type()", () => {
    assert.match(serverGroup.type, rawGroup.type)
  })

  it("should verify the getter value of #iconid()", () => {
    assert.match(serverGroup.iconid, rawGroup.iconid)
  })

  it("should verify the getter value of #savedb()", () => {
    assert.match(serverGroup.savedb, rawGroup.savedb)
  })

  it("should verify the getter value of #sortid()", () => {
    assert.match(serverGroup.sortid, rawGroup.sortid)
  })

  it("should verify the getter value of #namemode()", () => {
    assert.match(serverGroup.namemode, rawGroup.namemode)
  })

  it("should verify the getter value of #nModifyp()", () => {
    assert.match(serverGroup.nModifyp, rawGroup.n_modifyp)
  })

  it("should verify the getter value of #nMemberAddp()", () => {
    assert.match(serverGroup.nMemberAddp, rawGroup.n_member_addp)
  })

  it("should verify the return value of #getNameSpace()", () => {
    assert.match(serverGroup.getNameSpace(), "servergroup")
  })

  it("should verify return parameters of #getSGID()", () => {
    assert.match(serverGroup.getSGID(), rawGroup.sgid)
  })

  it("should verify execute parameters of #del()", async () => {
    await serverGroup.del(1)
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupdel", { sgid: rawGroup.sgid, force: 1 })
  })

  it("should verify execute parameters of #copy()", async () => {
    await serverGroup.copy(0, 1, "New ServerGroup")
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupcopy", {
      ssgid: rawGroup.sgid,
      tsgid: 0,
      type: 1,
      name: "New ServerGroup"
    })
  })

  it("should verify execute parameters of #rename()", async () => {
    await serverGroup.rename("New Group Name")
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergrouprename", { sgid: rawGroup.sgid, name: "New Group Name" })
  })

  it("should verify execute parameters of #permList()", async () => {
    await serverGroup.permList(true)
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergrouppermlist", { sgid: rawGroup.sgid }, ["-permsid"])
  })

  it("should verify execute parameters of #addPerm()", async () => {
    await serverGroup.addPerm("i_channel_subscribe_power", 25)
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupaddperm", {
      permsid: "i_channel_subscribe_power",
      permvalue: 25,
      sgid: rawGroup.sgid,
      permskip: 0,
      permnegated: 0
    })
  })

  it("should verify execute parameters of #delPerm()", async () => {
    await serverGroup.delPerm("i_channel_subscribe_power")
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupdelperm", {
      permsid: "i_channel_subscribe_power",
      sgid: rawGroup.sgid
    })
  })

  it("should verify execute parameters of #addClient()", async () => {
    await serverGroup.addClient(5)
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupaddclient", {
      cldbid: 5,
      sgid: rawGroup.sgid
    })
  })

  it("should verify execute parameters of #delClient()", async () => {
    await serverGroup.delClient(5)
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupdelclient", {
      cldbid: 5,
      sgid: rawGroup.sgid
    })
  })

  it("should verify execute parameters of #clientList()", async () => {
    await serverGroup.clientList()
    assert.calledOnce(stub)
    assert.calledWith(stub, "servergroupclientlist", { sgid: rawGroup.sgid }, ["-names"])
  })

  it("should validate the return value of #getIcon()", done => {
    stub.onCall(0).resolves([{ permsid: "i_icon_id", permvalue: 9999 }])
    stub.onCall(1).resolves([{ size: 0, msg: "nok" }])
    serverGroup.getIcon()
      .then(() => done("Expected Promise to reject!"))
      .catch(err => {
        assert.calledTwice(stub)
        assert.match(err.message, "nok")
        done()
      })
  })

  it("should validate the return value of #getIconName()", async () => {
    stub.onCall(0).resolves([{ permsid: "i_icon_id", permvalue: 9999 }])
    const name = await serverGroup.getIconName()
    assert.calledOnce(stub)
    deepEqual(name, "icon_9999")
  })



})