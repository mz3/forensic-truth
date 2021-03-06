/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Heading } from 'grommet'

import * as R from 'ramda'

// Components
import FormFieldComponent from './FormField'

// styles
import { StyledFormWrapper } from './SingleStepForm.styled.js'

const PersonalInfoStep = observer(
  ({ questionList, header, saveData, personalInfo, setPersonalInfo, setDisableNext }) => {
    const [questions, setQuestions] = useState([])
    const [currentSubqs, setCurrentSubqs] = useState([])

    useEffect(() => {
      setQuestions(questionList)
      const subqs = R.reduce((acc, { subQuestions }) => acc.concat(subQuestions), [], questionList)
      setCurrentSubqs(subqs)
    }, [questionList])

    useEffect(() => {
      const isRequired = (question) => question.required

      const isAnswered = (question) => R.has(question.id, personalInfo)
      const isRequiredAndAnswered = (question) => {
        return isRequired(question) ? R.both(isRequired, isAnswered)(question) : true
      }
      // remove currentSubquestions from questionlist to validate
      const filteredQuestionList = R.filter(
        (question) => !currentSubqs.includes(question.order.toString()),
        questions,
      )
      const validatedList = R.map(isRequiredAndAnswered, filteredQuestionList)
      const isInvalid = validatedList.includes(false)

      !!Object.keys(personalInfo).length && !isInvalid && setDisableNext(false)
    }, [Object.keys(personalInfo).length, currentSubqs.length])

    const onChange = useCallback(
      (e, id, type) => {
        const { name: field, value } = e.target
        // find subquestions for this question
        const filtered = questionList.find((singleQuestion) => singleQuestion.id === id)
        // set value in state
        setPersonalInfo({ field, value: e.option || value })

        if (type === 'yesNo') {
          if (value === 'true' && filtered?.subQuestions?.length) {
            // remove subquestion from currentSubqs
            setCurrentSubqs(R.without(filtered.subQuestions, currentSubqs))
          } else {
            // add subquestion back to  currentSubqs
            const subqs = R.reduce(
              (acc, { subQuestions }) => acc.concat(subQuestions),
              [],
              questionList,
            )
            setCurrentSubqs(subqs)
          }
        }

        if (type === 'yesNo reverse') {
          if (value === 'false' && filtered?.subQuestions?.length) {
            // remove subquestion from currentSubqs
            setCurrentSubqs(R.without(filtered.subQuestions, currentSubqs))
          } else {
            // add subquestion back to  currentSubqs
            const subqs = R.reduce(
              (acc, { subQuestions }) => acc.concat(subQuestions),
              [],
              questionList,
            )
            setCurrentSubqs(subqs)
          }
        }
      },
      [currentSubqs],
    )

    const onAddMore = (options, id) => {
      const findSubQ = (option) => {
        return R.find(R.propEq('order', Number(option)))(questionList)
      }
      const idx = R.findIndex(R.propEq('id', id), questionList)
      const subQuestions = R.map(findSubQ, options)
      const updated = R.insert(idx, [...subQuestions], questions)
      setQuestions(R.flatten(updated))
    }

    const components = useMemo(
      () =>
        questions.map((question, i) => (
          <FormFieldComponent
            key={`${question.id}-${i}`}
            onChange={onChange}
            onAddMore={onAddMore}
            question={question}
            personalInfo={personalInfo}
            currentSubqs={currentSubqs}
          />
        )),
      [personalInfo, questions, currentSubqs],
    )

    return (
      <StyledFormWrapper height="100vh" alignSelf="center">
        <Heading alignSelf="center" textAlign="center" level={3}>
          {header}
        </Heading>
        <Form validate="blur" onSubmit={() => saveData(personalInfo)}>
          {components}
        </Form>
      </StyledFormWrapper>
    )
  },
)

export default PersonalInfoStep
