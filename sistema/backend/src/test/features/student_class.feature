Feature: Student and Class management

  Scenario: Create a student and enroll in a class
    Given the server is running
    When I create a student with name "Test Student" and email "test@example.com"
    And I create a class with topic "Test Topic" year 2026 and semester 1
    And I enroll the created student in the created class
    Then the class should include the student
