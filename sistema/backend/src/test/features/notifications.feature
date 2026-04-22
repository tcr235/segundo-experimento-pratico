Feature: Daily batched email notifications

  Scenario: Multiple evaluation updates result in single aggregated email per student
    Given the server is running
    When I create a student with name "Notify Student" and email "notify@example.com"
    And I create a class with topic "Notify Topic" year 2026 and semester 1
    And I create an evaluation with status "MANA" for that student and class
    And I create another evaluation with status "MPA" for that student and class
    When I trigger daily notifications
    Then the notification send endpoint should report 1 sent result
