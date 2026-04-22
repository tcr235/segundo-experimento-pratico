Feature: Evaluations

  Scenario: Reject invalid statuses and accept valid ones
    Given the server is running
    When I create a student with name "Eval Student" and email "eval@example.com"
    And I create a class with topic "Eval Topic" year 2026 and semester 1
    And I try to create an evaluation with status "INVALID" for that student and class
    Then the response should be a 400 error
    When I create an evaluation with status "MANA" for that student and class
    Then the response should be a 201 Created
