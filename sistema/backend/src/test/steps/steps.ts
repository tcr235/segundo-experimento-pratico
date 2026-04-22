const { Given, When, Then, Before } = require("@cucumber/cucumber");
import request from "supertest";
import fs from "fs";
import path from "path";
import assert from "assert";

// import the express app (server exports app)
import app from "../../server";

const DATA_DIR = path.resolve(__dirname, "..", "..", "data");
const files = [
  "students.json",
  "classes.json",
  "evaluations.json",
  "pendingNotifications.json",
];

function resetData() {
  for (const f of files) {
    const p = path.join(DATA_DIR, f);
    try {
      fs.writeFileSync(p, "[]");
    } catch (err) {
      // ignore
    }
  }
}

Before(function (this: any) {
  resetData();
  // store context
  this.lastResponse = undefined;
  this.created = {};
});

Given("the server is running", async function (this: any) {
  // supertest uses the app directly; nothing to do.
});

When(
  "I create a student with name {string} and email {string}",
  async function (this: any, name: string, email: string) {
    const res = await request(app)
      .post("/students")
      .send({ name, cpf: "000.000.000-00", email });
    assert(
      res.status === 201,
      `Expected 201 creating student, got ${res.status}`,
    );
    this.created.student = res.body;
  },
);

When(
  "I create a class with topic {string} year {int} and semester {int}",
  async function (this: any, topic: string, year: number, semester: number) {
    const res = await request(app)
      .post("/classes")
      .send({ topic, year, semester });
    assert(
      res.status === 201,
      `Expected 201 creating class, got ${res.status}`,
    );
    this.created.class = res.body;
  },
);

When(
  "I enroll the created student in the created class",
  async function (this: any) {
    const cls = this.created.class;
    const st = this.created.student;
    const res = await request(app)
      .post(`/classes/${cls.id}/enroll`)
      .send({ studentId: st.id });
    assert(
      res.status === 204,
      `Expected 204 enrolling student, got ${res.status}`,
    );
  },
);

Then("the class should include the student", async function (this: any) {
  const cls = this.created.class;
  const res = await request(app).get(`/classes/${cls.id}`);
  assert(res.status === 200);
  const body = res.body;
  const students: string[] = body.students || [];
  assert(students.includes(this.created.student.id), "student not enrolled");
});

When(
  "I try to create an evaluation with status {string} for that student and class",
  async function (this: any, status: string) {
    const st = this.created.student;
    const cls = this.created.class;
    const res = await request(app)
      .post("/evaluations")
      .send({ studentId: st.id, classId: cls.id, goal: "G", status });
    this.lastResponse = res;
  },
);

Then("the response should be a 400 error", function (this: any) {
  assert(this.lastResponse, "no response");
  assert(
    this.lastResponse.status === 400,
    `expected 400, got ${this.lastResponse.status}`,
  );
});

When(
  "I create an evaluation with status {string} for that student and class",
  async function (this: any, status: string) {
    const st = this.created.student;
    const cls = this.created.class;
    const res = await request(app)
      .post("/evaluations")
      .send({ studentId: st.id, classId: cls.id, goal: "G", status });
    this.lastResponse = res;
  },
);

Then("the response should be a 201 Created", function (this: any) {
  assert(this.lastResponse, "no response");
  assert(
    this.lastResponse.status === 201,
    `expected 201, got ${this.lastResponse.status}`,
  );
});

When(
  "I create another evaluation with status {string} for that student and class",
  async function (this: any, status: string) {
    const st = this.created.student;
    const cls = this.created.class;
    const res = await request(app)
      .post("/evaluations")
      .send({ studentId: st.id, classId: cls.id, goal: "G2", status });
    assert(
      res.status === 201,
      `Expected 201 creating evaluation, got ${res.status}`,
    );
  },
);

When("I trigger daily notifications", async function (this: any) {
  const res = await request(app).post("/notifications/send-daily").send({});
  this.lastResponse = res;
});

Then(
  "the notification send endpoint should report {int} sent result",
  function (this: any, expected: number) {
    assert(this.lastResponse, "no response");
    assert(
      this.lastResponse.status === 200,
      `expected 200, got ${this.lastResponse.status}`,
    );
    const body = this.lastResponse.body;
    const sentCount = (body.results || []).filter((r: any) => r.sent).length;
    assert(
      sentCount === expected,
      `expected ${expected} sent but got ${sentCount}`,
    );
  },
);
