function updateScore(score,id) {

    data_to_send = {
        "current": score,
        "id": id
    }
    $.ajax({
        type: "POST",
        url: "score",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data_to_send),
        success: function (result) {
            user_score = result["user_score"]
            score = user_score
            console.log("Score updated")
        },
        error: function (request, status, error) {
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)

        }
    });
}
let correct_selections = 0;
function pairing_quiz() {
    
    try {
        $(".draggable").draggable({
            cursor: "move",
            revert: "invalid",
        });
        let optionsNotNone = ["split", "complementary", "analogous", "monochromatic", "triadic", "tetradic"]

        optionsNotNone.forEach(function (option) {
            $("." + option).droppable({
                accept: ".draggable",
                classes: {
                    "ui-droppable-hover": "droppable:hover",
                    "ui-droppable-active": `ui-${option}`,
                },
                drop: function (event, ui) {
                    $(ui.draggable).hide()
                    $(this).html($(ui.draggable).data().name == "split" ? "Split complementary" : $(ui.draggable).data().name)
                    if (option == $(ui.draggable).data().name) {
                        correct_selections += 1
                    }
                    $("." + option).droppable({
                        accept:".none"
                    })
                }
            });

            $(`#${option}`).click(function () {
                $("." + option).droppable({
                    accept: ".draggable",
                    classes: {
                        "ui-droppable-hover": "droppable:hover",
                        "ui-droppable-active": `ui-${option}`,
                    },
                    drop: function (event, ui) {
                        $(ui.draggable).hide()
                        $(this).html($(ui.draggable).data().name == "split" ? "Split complementary" : $(ui.draggable).data().name)
                        if (option == $(ui.draggable).data().name) {
                            correct_selections += 1
                        }
                        $("." + option).droppable({
                            accept: ".none"
                        })
                    }
                });
                let buttonId = $(`#${option}`).html() == "Split complementary" ? "split" : $(`#${option}`).html()
                if (option == buttonId) {
                    correct_selections -= 1;
                }
                $(`#${buttonId}-draggable`).show()
                $(`#${option}`).html('')
                $(`#${buttonId}-draggable`).css("left", "0")
                $(`#${buttonId}-draggable`).css("top", "0")
            })
        });

    } catch (error) {
        console.log(error);
    }


}


$(document).ready(function () {
    var checked = false;
    var timeOut = 1000;
    $(".color-selection").click(function () {
        let color = $(this).children()[0].value
        colorPicker.setColors(["#4098e5", "#98e540", color])
    });
    $("#quizAnswerFeedback").empty();
    $("#PairingAnswers").empty();
    pairing_quiz();
    $("#nextButtonQuiz").click(function () {
        if (checked == false) {
            checked = true;
            let checked_answer;
            try {
                checked_answer = (document.querySelector('input[name = "q_answer"]:checked')).value;
            } catch (error) {
                // checked_answer = correct_selections;
            }

            $.ajax({
                type: "POST",
                url: "/quiz/update",
                success: function (result) {
                    console.log("Score updated")
                    console.log(result)
                }
            });

            var correct_answer = quiz.answer[0]
            let nextQues = ''
            if (quiz.question_type!='pairing') {
                if (checked_answer == correct_answer) {
                    $("#quizAnswerFeedback").append("<div class='row alert alert-success' role='alert'>Correct Answer!</div>");
                    setTimeout(() => {
                        updateScore(score,quiz.id);
                    }, 500)
                }
                else {
                    timeOut=2000
                    $("#quizAnswerFeedback").append("<div class='row alert alert-danger' role='alert'>Incorrect Answer. The correct answer is : " + correct_answer + "</div>");
                    
                }

            }

            else {
                if(correct_selections >= 6 ){
                    $("#quizAnswerFeedback").append("<div class='row alert alert-success' role='alert'>Correct Answer!</div>");
                    setTimeout(() => {
                        updateScore(score,quiz.id);
                    }, 500)
                    
                }
                else {
                    timeOut=2500
                    $("#quizAnswerFeedback").append("<div class='row alert alert-danger' role='alert'>Incorrect Answer </div>");
                    for(let i=0;i<(quiz.answer).length;i++) {
                        $("#PairingAnswers").append("<div class='col-2 mt-5'> <center> <div class='btn btn-outline-success'>"+quiz.answer[i]+"</div> </center> </div>")
                    }
                }

            }
            
            nextQues = quiz.next
            setTimeout(() => {
                window.location.href = '/quiz/' + nextQues;
            }, timeOut)
        }
        });
    
});